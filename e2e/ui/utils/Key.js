/* global browser */

import assert from 'assert';
import { expect } from 'chai';
import { dataComp, dataField, attributeSelector } from './selector-utils';

const timeout = 5000;

const addKeyPage = dataComp('add-key-page');
const keyEditPage = dataComp('key-edit-page');
const keyNameInput = dataField('new-key-name-input');
const keyPathSuggestions = `${dataComp('new-key-name')} ${dataField('suggestions')}`;
const keyValueTypeSelector = dataComp('key-value-type-selector');
const keyFormatSelector = dataComp('key-format-selector');
const saveChangesButton = dataComp('save-changes');
const displayName = `${dataComp('display-name')} ${dataField('text')}`;
const defaultValue = dataComp('default-value');
const rulesEditor = dataComp('key-rules-editor');
const tabHeader = attributeSelector('data-tab-header');
const sourceTab = `${rulesEditor} ${tabHeader('source')}`;
const rulesTab = `${rulesEditor} ${tabHeader('rules')}`;

const toggleButton = comp => `${dataComp(comp)} ${dataComp('expander-toggle')}`;

class Key {
  BLANK_KEY_NAME = '_blank';

  open(keyName = '', waitToLoad = true) {
    browser.url(`/keys/${keyName}`);
    browser.waitForVisible(dataComp('key-page'), timeout);

    if (keyName !== '' && waitToLoad) {
      this.waitToLoad();

      expect(this.hasChanges, 'should not have changes').to.be.false;
      expect(this.isSaving, 'should not be in saving state').to.be.false;
    }

    return this;
  }

  add() {
    this.open();
    browser.click(dataComp('add-new-key'));
    browser.waitForVisible(addKeyPage, timeout);
    return this;
  }

  clickContinue() {
    browser.waitForEnabled(dataComp('add-key-button'), timeout);
    browser.click(dataComp('add-key-button'));
  }

  continueToDetails() {
    this.clickContinue();
    return this.waitToLoad();
  }

  get hasChanges() {
    return browser.getAttribute(saveChangesButton, 'data-state-has-changes') === 'true';
  }

  get isSaving() {
    return browser.getAttribute(saveChangesButton, 'data-state-is-saving') === 'true';
  }

  get displayName() {
    browser.waitForText(displayName);
    return browser.getText(displayName);
  }

  get defaultValue() {
    browser.waitForVisible(defaultValue, timeout);
    return browser.getValue(defaultValue);
  }

  get exists() {
    return browser.isExisting(keyEditPage);
  }

  get source() {
    browser.waitForVisible('.monaco-editor', 10000);
    const keySourceCode = browser.execute(function() {
      return window.monaco.editor.getModels()[0].getValue();
    });

    return JSON.parse(keySourceCode.value);
  }

  set source(value) {
    browser.waitForVisible('.monaco-editor', 10000);
    browser.execute(function(source) {
      window.monaco.editor.getModels()[0].setValue(source);
    }, value);
  }

  waitToLoad() {
    browser.waitForVisible(keyEditPage, timeout);
    return this;
  }

  isCurrent(keyName) {
    const location = browser.getUrl();
    return location.endsWith(`keys/${keyName}`);
  }

  setName(keyName) {
    browser.clickWhenVisible(keyNameInput, timeout);

    assert(
      browser.isExisting(keyPathSuggestions),
      'should show key name suggestions on input focus',
    );

    browser.setValue(keyNameInput, keyName);
    return this;
  }

  setValueType(valueType) {
    browser.waitForVisible(keyValueTypeSelector, timeout);
    browser.setValue(keyValueTypeSelector, valueType);
    return this;
  }

  setKeyFormat(format) {
    browser.waitForVisible(keyFormatSelector, timeout);
    browser.setValue(keyFormatSelector, format);
    return this;
  }

  setDefaultValue(value) {
    browser.setValue(defaultValue, value);
    return this;
  }

  commitChanges(selector = saveChangesButton) {
    if (selector === saveChangesButton) assert.ok(this.hasChanges, 'no changes to commit');
    browser.click(selector);
    browser.waitUntil(() => !this.hasChanges && !this.isSaving, timeout, 'changes were not saved');
    return this;
  }

  clickSave() {
    browser.click(saveChangesButton);
    return this;
  }

  goToSourceTab() {
    browser.clickWhenVisible(sourceTab, timeout);
    return this;
  }

  goToRulesTab() {
    browser.clickWhenVisible(rulesTab, timeout);
    return this;
  }

  toggle(section) {
    browser.clickWhenVisible(toggleButton(section), timeout);
    return this;
  }
}

export default new Key();
