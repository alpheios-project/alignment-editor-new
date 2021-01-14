import EnUsCommon from '@/locales/en-us/messages-common.json'
import EnUsControllers from '@/locales/en-us/messages-controllers.json'

import EnUsLanguages from '@/locales/en-us/messages-languages.json'
import EnUsTextEditor from '@/locales/en-us/messages-text-editor.json'
import EnUsAlignedGroupsEditor from '@/locales/en-us/messages-aligned-groups-editor.json'
import EnUsTokensEditEditor from '@/locales/en-us/messages-tokens-edit-editor.json'
import EnUsMainMenu from '@/locales/en-us/messages-main-menu.json'
import EnUsOptionsBlock from '@/locales/en-us/messages-options-block.json'
import EnUsMetadataTerm from '@/locales/en-us/messages-metadata-terms.json'

import EnGb from '@/locales/en-gb/messages.json'

import MessageBundle from '@/lib/l10n/message-bundle'

const localeEnUs = 'en-US'
const localeEnGb = 'en-GB'
const availableMessages = {
  [localeEnUs]: [EnUsCommon, EnUsControllers, EnUsTextEditor, EnUsMainMenu, EnUsAlignedGroupsEditor, EnUsTokensEditEditor, EnUsLanguages, EnUsOptionsBlock, EnUsMetadataTerm],
  [localeEnGb]: [EnGb]
}

export default {
  en_US: localeEnUs,
  en_GB: localeEnGb,
  availableMessages: availableMessages,

  predefinedLocales: () => {
    const finalLocales = []
    Object.keys(availableMessages).forEach(localeItem => {
      availableMessages[localeItem].forEach(messageItem => finalLocales.push([messageItem, localeItem]))
    })

    return finalLocales
  },

  /**
   * A helper function that creates a message bundle out of a messages JSON and a locale.
   * @param {string | object} messagesJSONorObj - Messages for a locale as a JSON string or as an object.
   * @param {string} locale - A locale code for a message group. IETF language tag format is recommended.
   * @return {MessageBundle} A message bundle with messages from JSON.
   */
  createBundle: (messagesJSONorObj, locale) => {
    return new MessageBundle(messagesJSONorObj, locale)
  },
  /**
   * Same as above, but creates an array of message bundles out of an array of messages JSONs and a locales.
   * @param {Array.<string | object, number>[]} msgArr - An array of arrays with
   * the first element being {string | object} messagesJSONorObj - messages for a locale as a JSON string or as an object,
   * and the second element being {string} locale - a locale code for a message group. IETF language tag format is recommended.
   * @return {MessageBundle[]} An array of message bundles.
   */
  createBundleArr: (msgArr) => {
    return msgArr.map((m) => new MessageBundle(...m))
  },
  /**
   * Creates an array of message bundles out of all availableMessages.
   * @return {MessageBundle[]} An array of message bundles.
   */
  bundleArr: () => {
    let msgArray = [] // eslint-disable-line prefer-const
    for (const [locale, messages] of Object.entries(availableMessages)) {
      msgArray.push(...messages.map(m => new MessageBundle(m, locale)))
    }
    return msgArray
  }
}
