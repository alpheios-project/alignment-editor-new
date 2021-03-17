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
    return textType === 'origin' ? this.origin.langName : this.targets[targetId].langName
  }

  getMetadata (textType, targetId) {
    return textType === 'origin' ? this.origin.metadata : this.targets[targetId].metadata
  }

  getMetadataShort (textType, targetId) {
    return textType === 'origin' ? this.origin.metadataShort : this.targets[targetId].metadataShort
  }

  getSegments (textType, targetId) {
    return textType === 'origin' ? this.origin.segments : this.targets[targetId].segments
  }
}
