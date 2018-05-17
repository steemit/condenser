import numeral from 'numeral';

export const pretty = (num) => {
  return numeral(num).format('0,0.00');
}

export const prettyInt = (num) => {
  return numeral(num).format('0,0');
}

export const short = (num) => {
  if (num > 1000000000) {
    return pretty(num / 1000000000) + 'B';
  }
  if (num > 1000000) {
    return pretty(num / 1000000) + 'M';
  }
  if (num > 1000) {
    return pretty(num / 1000) + 'K';
  }
  return numeral(num).format('0,0.00');
}

export const shortInt = (num) => {
  if (num > 1000000000) {
    return integerize(num / 1000000000) + 'B';
  }
  if (num > 1000000) {
    return integerize(num / 1000000) + 'M';
  }
  if (num > 1000) {
    return integerize(num / 1000) + 'K';
  }
  return integerize(num)
}

export const integerize = (num) => {
  return numeral(num).format('0,0');
}