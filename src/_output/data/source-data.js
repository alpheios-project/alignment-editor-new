export default class SourceData {
  constructor (fullData) {
    this.origin = fullData.origin
    this.targets = fullData.targets
  }

  getDir (textType, targetId) {
    return textType === 'origin' ? this.origin.dir : this.targets[targetId].dir
  }

  getLang (textType, targetId) {
    return textType === 'origin' ? this.origin.lang : this.targets[targetId].lang
  }

  getLangName (textType, targetId) {
    let langName = textType === 'origin' ? this.origin.langName : this.targets[targetId].langName
    langName = langName.replace(' (Ancient –1453)', '')
    return langName
  }

  getMetadata (textType, targetId) {
    return textType === 'origin' ? this.origin.metadata : this.targets[targetId].metadata
  }

  getMetadataShort (textType, targetId) {
    return textType === 'origin' ? this.origin.metadataShort : this.targets[targetId].metadataShort
  }

  getFilterButtonTitle (textType, targetId) {
    return textType === 'origin' ? this.origin.filterButtonTitle : this.targets[targetId].filterButtonTitle
  }

  getSegments (textType, targetId) {
    return textType === 'origin' ? this.origin.segments : this.targets[targetId].segments
  }
}
