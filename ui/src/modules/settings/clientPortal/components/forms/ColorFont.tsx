import FormGroup from 'erxes-ui/lib/components/form/Group';
import ControlLabel from 'erxes-ui/lib/components/form/Label';
import { FlexContent } from 'erxes-ui/lib/layout/styles';
import { ColorPick, ColorPicker } from 'modules/settings/styles';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import TwitterPicker from 'react-color/lib/Twitter';
import { COLORS } from '../../constants';
import { Content } from '../../styles';
import { Styles } from '../../types';

type Props = {
  styles?: Styles;
  handleFormChange: (name: string, value: string | object) => void;
};

type Item = {
  label: string;
  name: string;
  value?: string;
};

function ColorFont({ styles = {}, handleFormChange }: Props) {
  const {
    bodyColor,
    headerColor,
    footerColor,
    helpColor,
    backgroundColor,
    activeTabColor,
    linkColor,
    linkHoverColor
  } = styles;

  function renderColor({ label, name, value }: Item) {
    const handleChange = e => {
      const currentStyles = { ...styles };

      currentStyles[name] = e.hex;

      handleFormChange('styles', currentStyles);
    };

    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        <div>
          <OverlayTrigger
            trigger="click"
            rootClose={true}
            placement="bottom"
            overlay={
              <Popover id={name}>
                <TwitterPicker
                  width="266px"
                  triangle="hide"
                  color={{ hex: value || COLORS[0] }}
                  onChange={handleChange}
                  colors={COLORS}
                />
              </Popover>
            }
          >
            <ColorPick>
              <ColorPicker style={{ backgroundColor: value }} />
            </ColorPick>
          </OverlayTrigger>
        </div>
      </FormGroup>
    );
  }

  return (
    <Content>
      <FormGroup>
        <ControlLabel>Background color</ControlLabel>
        <FlexContent>
          {renderColor({
            label: 'Body',
            name: 'bodyColor',
            value: bodyColor
          })}
          {renderColor({
            label: 'Header',
            name: 'headerColor',
            value: headerColor
          })}
          {renderColor({
            label: 'Footer',
            name: 'footerColor',
            value: footerColor
          })}
          {renderColor({
            label: 'Help Center',
            name: 'helpColor',
            value: helpColor
          })}
        </FlexContent>
      </FormGroup>
      <FormGroup>
        <ControlLabel>Tab colors</ControlLabel>
        <FlexContent>
          {renderColor({
            label: 'Background',
            name: 'backgroundColor',
            value: backgroundColor
          })}
          {renderColor({
            label: 'Active tab',
            name: 'activeTabColor',
            value: activeTabColor
          })}
        </FlexContent>
      </FormGroup>
      <FormGroup>
        <ControlLabel>Portal fonts</ControlLabel>
      </FormGroup>
      <FormGroup>
        <ControlLabel>Link color</ControlLabel>
        <FlexContent>
          {renderColor({
            label: 'Link text',
            name: 'linkColor',
            value: linkColor
          })}
          {renderColor({
            label: 'Link hover text',
            name: 'linkHoverColor',
            value: linkHoverColor
          })}
        </FlexContent>
      </FormGroup>
    </Content>
  );
}

export default ColorFont;
