import { colors, dimensions } from 'modules/common/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const ConversationWrapper = styled.div`
  height: 100%;
  overflow: auto;
  min-height: 100px;
  background: ${colors.bgLight};
`;

const ActionBarLeft = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const AssignTrigger = styled.div`
  padding-left: ${dimensions.unitSpacing}px;
  margin-right: ${dimensions.unitSpacing}px;

  i {
    margin-left: 5px;
    margin-right: -6px;
    transition: all ease 0.3s;
    color: ${colors.colorCoreGray};
    display: inline-block;

    @media (max-width: 768px) {
      display: none;
    }
  }

  &:hover {
    cursor: pointer;
  }

  &[aria-describedby] {
    color: ${colors.colorSecondary};

    i {
      transform: rotate(180deg);
    }
  }
`;

const AssignText = styled.div`
  display: inline-block;
`;

const MailSubject = styled.h3`
  margin: 0 0 ${dimensions.unitSpacing}px 0;
  font-weight: bold;
  font-size: 18px;
  line-height: 22px;
`;

const FacebookTaggedMessage = styled.div`
  margin-top: 15px;
`;

const Char = styledTS<{ count: number }>(styled.div)`
  color: ${props =>
    props.count > 10
      ? props.count < 30 && colors.colorCoreOrange
      : colors.colorCoreRed};
  font-weight: bold;
  display:flex;
  justify-content:flex-end;
  padding-top:10px;
  padding-right:15px;
  font-size:12px;
  background-color:gray;
`;

export {
  FacebookTaggedMessage,
  ConversationWrapper,
  ActionBarLeft,
  AssignTrigger,
  AssignText,
  MailSubject,
  Char
};
