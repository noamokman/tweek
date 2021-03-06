/* global describe, before, beforeEach, after, it, browser */

import { expect } from 'chai';
import Key from '../../utils/Key';
import { dataComp, dataField } from '../../utils/selector-utils';
import { login } from '../../utils/auth-utils';

const addEmptyKey = (keyName, keyValueType = 'String') => {
  Key.add()
    .setName(keyName)
    .setValueType(keyValueType)
    .setKeyFormat('jpad')
    .continueToDetails()
    .commitChanges();
};

const keyNameValidation = `${dataComp('new-key-name')} ${dataComp('validation-icon')}`;

describe('key name validations', () => {
  before(() => login());

  describe('name validations', () => {
    const invalidKeyNames = [
      'key name',
      'keyname@',
      'keyName',
      '/keyname',
      'key@name/',
      'category/key@_name',
      '@keyName',
      '@category/@keyName',
      Key.BLANK_KEY_NAME,
    ];
    const validKeyNames = [
      'key_name',
      'category/key_name',
      'category/key_name/key_name',
      '@key_name',
      '@category/@keyname',
    ];

    before(() => Key.add());

    invalidKeyNames.forEach(keyName => {
      it('should show validation icon for invalid key name', () => {
        Key.setName(keyName);
        browser.waitForVisible(keyNameValidation, 1000);
      });
    });

    validKeyNames.forEach(keyName => {
      it('should not show validation icon for valid key name', () => {
        Key.setName(keyName);
        browser.waitForVisible(keyNameValidation, 1000, true);
      });
    });
  });

  it('should show validaton alert on clicking "Continue" without a value', () => {
    Key.add()
      .setValueType('string') // to make local changes
      .clickContinue();

    browser.waitForVisible(keyNameValidation, 2000);
  });

  it('should allow creating a key named "a/b/c" and also a key named "b"', () => {
    addEmptyKey('a/b/c');
    browser.refresh();
    addEmptyKey('b');
  });
});
