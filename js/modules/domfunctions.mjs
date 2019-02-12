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

function appendChildren(elem, arr) {
  arr.forEach((childNode) => {
    elem.appendChild(childNode);
  });
}

function removeAllChildren(elem) {
  while (elem.firstChild) {
    elem.removeChild(elem.firstChild);
  }
}

export {
  allElementsExist, setAttributes, appendChildren, removeAllChildren,
};
