import { addBoardItem } from './actions';
import { setProperty } from './actions/setProperty';
import { ACTIONS } from './constants';
import { debugBase } from './debuggers';
import { getActionsMap } from './helpers';
import { sendRPCMessage } from './messageBroker';
import Automations, {
  IActionsMap,
  ITrigger,
  TriggerType
} from './models/Automations';
import { Executions, EXECUTION_STATUS, IExecutionDocument } from './models/Executions';

export const getEnv = ({
  name,
  defaultValue
}: {
  name: string;
  defaultValue?: string;
}): string => {
  const value = process.env[name];

  if (!value && typeof defaultValue !== 'undefined') {
    return defaultValue;
  }

  if (!value) {
    debugBase(`Missing environment variable configuration for ${name}`);
  }

  return value || '';
};

export const isInSegment = async (segmentId: string, targetId: string) => {
  const response = await sendRPCMessage('isInSegment', { segmentId, targetId });
  return response.check;
};

export let tags: any[] = [];
export let tasks: any[] = [];
export let deals: any[] = [];
export let customers: any[] = [];

export const reset = () => {
  tags = [];
  tasks = [];
  deals = [];
  customers = [];
};

export const executeActions = async (
  triggerType: string,
  execution: IExecutionDocument,
  actionsMap: IActionsMap,
  currentActionId?: string,
): Promise<string> => {
  if (!currentActionId) {
    execution.status = EXECUTION_STATUS.COMPLETE
    execution.save();

    return 'finished';
  }

  const action = actionsMap[currentActionId];
  if (!action) {
    execution.status = EXECUTION_STATUS.MISSID;
    execution.save()

    return 'missed action'
  }

  execution.status = EXECUTION_STATUS.ACTIVE;
  execution.actions = [...(execution.actions || []), {
    actionId: currentActionId,
    actionType: action.type,
    actionConfig: action.config,
    nextActionId: action.nextActionId
  }];
  execution.save();

  try {
    if (action.type === ACTIONS.WAIT) {
      execution.waitingActionId = action.id;
      execution.startWaitingDate = new Date();
      execution.status = EXECUTION_STATUS.WAITING;
      execution.save();
      return 'paused';
    }

    if (action.type === ACTIONS.IF) {
      let ifActionId;

      if (await isInSegment(action.config.contentId, execution.targetId)) {
        ifActionId = action.config.yes;
      } else {
        ifActionId = action.config.no;
      }

      return executeActions(triggerType, execution, actionsMap, ifActionId);
    }

    if (action.type === ACTIONS.GO_TO) {
      return executeActions(
        triggerType,
        execution,
        actionsMap,
        action.config.toId
      );
    }

    if (action.type === ACTIONS.SET_PROPERTY) {
      await setProperty({
        triggerType,
        actionConfig: action.config,
        target: execution.target
      });
    }

    if (
      action.type === ACTIONS.CREATE_TASK ||
      action.type === ACTIONS.CREATE_TICKET ||
      action.type === ACTIONS.CREATE_DEAL
    ) {
      const type = action.type.substring(6).toLocaleLowerCase();

      await addBoardItem({ action, execution, type });
    }

    if (action.type === ACTIONS.REMOVE_DEAL) {
      deals = deals.filter(t => !action.config.names.includes(t));
    }
  } catch (e) {
    execution.status = EXECUTION_STATUS.ERROR
    execution.description = `An error occurred while working action: ${e.message}`
    execution.save()
    return;
  }

  return executeActions(
    triggerType,
    execution,
    actionsMap,
    action.nextActionId
  );
};

export const calculateExecution = async ({
  automationId,
  trigger,
  target
}: {
  automationId: string;
  trigger: ITrigger;
  target: any;
}): Promise<IExecutionDocument> => {
  const { id, type, config } = trigger;
  const { reEnrollment, reEnrollmentRules, contentId } = config;
  try {
    if (!await isInSegment(contentId, target._id)) {
      return;
    }
  } catch (e) {
    await Executions.createExecution({
      automationId,
      triggerId: id,
      triggerType: type,
      triggerConfig: config,
      targetId: target._id,
      target,
      status: EXECUTION_STATUS.ERROR,
      description: `An error occurred while checking the is in segment: "${e.message}"`
    });
    return;
  }

  const executions = await Executions.find({
    automationId,
    triggerId: id,
    targetId: target._id
  }).sort({ createdAt: -1 }).limit(1).lean();

  const latestExecution: IExecutionDocument = executions.length && executions[0];

  if (latestExecution) {
    if (!reEnrollment || !reEnrollmentRules.length) {
      return;
    }

    let isChanged = false;

    for (const reEnrollmentRule of reEnrollmentRules) {
      if (latestExecution.target[reEnrollmentRule] !== target[reEnrollmentRule]) {
        isChanged = true;
        break;
      }
    }

    if (!isChanged) {
      return;
    }
  }

  return Executions.createExecution({
    automationId,
    triggerId: id,
    triggerType: type,
    triggerConfig: config,
    targetId: target._id,
    target,
    status: EXECUTION_STATUS.ACTIVE,
    description: `Met enrollement criteria`
  });
};

/*
 * target is one of the TriggerType objects
 */
export const receiveTrigger = async ({
  type,
  targets
}: {
  type: TriggerType;
  targets: any[];
}) => {
  for (const target of targets) {
    const automations = await Automations.find({
      status: 'active',
      'triggers.type': { $in: [type] }
    }).lean();

    if (!automations.length) {
      return;
    }

    for (const automation of automations) {
      for (const trigger of automation.triggers) {
        if (trigger.type !== type) {
          continue;
        }

        const execution = await calculateExecution({
          automationId: automation._id,
          trigger,
          target
        });

        if (execution) {
          await executeActions(
            trigger.type,
            execution,
            await getActionsMap(automation.actions),
            trigger.actionId
          );
        }
      }
    }
  }
};
