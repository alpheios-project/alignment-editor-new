const floatRegexp = '[-+]?[0-9]*.?[0-9]+'

const types = [
  {
    name: 'px',
    regexp: new RegExp(`^${floatRegexp}px$`)
  },
  {
    name: '%',
    regexp: new RegExp(`^${floatRegexp}%$`)
  },
  /**
   * Fallback option
   * If no suffix specified, assigning "px"
   */
  {
    name: 'px',
    regexp: new RegExp(`^${floatRegexp}$`)
  }
]

const INPUT_NODE_NAMES = ['INPUT', 'TEXTAREA', 'SELECT']

const getType = value => {
  if (value === 'auto') {
    return {
      type: value,
      value: 0
    }
  }

  const type = types.find(type => type.regexp.test(value))

  if (type) {
    return {
      type: type.name,
      value: parseFloat(value)
    }
  }

  return {
    type: '',
    value: value
  }
}

export const parseNumber = value => {
  switch (typeof value) {
    case 'number':
      return { type: 'px', value }
    case 'string':
      return getType(value)
    default:
      return { type: '', value }
  }
}

export const validateNumber = value => {
  if (typeof value === 'string') {
    let num = parseNumber(value)

    return (num.type === '%' || num.type === 'px') && num.value > 0
  }

  return value >= 0
}

export const windowWidthWithoutScrollbar = () => {
  const { innerWidth } = window
  const { clientWidth } = document.documentElement

  if (innerWidth && clientWidth) {
    return Math.min(innerWidth, clientWidth)
  }

  return clientWidth || innerWidth
}

export const getTouchEvent = event => {
  return event.touches && event.touches.length > 0 ? event.touches[0] : event
}

export const isInput = element => {
  return element && INPUT_NODE_NAMES.indexOf(element.nodeName) !== -1
}

export const inRange = (from, to, value) => {
  return value < from ? from : value > to ? to : value
}