import { replacePlaceHolders } from '../helpers';
import { sendRPCMessage } from '../messageBroker';

export const addDeal = async ({ action, execution }) => {
  const newData = await replacePlaceHolders({ actionData: action.config, triggerData: { ...execution.triggerData, ...execution.actionsData } });
  return sendRPCMessage('deal', 'add-deal', { ...execution.triggerData, ...action.config, ...newData });
}