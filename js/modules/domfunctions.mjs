function allElementsExist(arrayOfQueries) {
  return arrayOfQueries.every(query => document.querySelector(query) != null);
}

function setAttributes(elem, obj) {
  Object.keys(obj).forEach((attribute) => {
    if (attribute === 'class' && Array.isArray(obj[attribute])) {
      elem.classList.add(...obj[attribute]);
    } else {
      elem.setAttribute(attribute, obj[attribute]);
    }
  });
}

export { allElementsExist, setAttributes };
