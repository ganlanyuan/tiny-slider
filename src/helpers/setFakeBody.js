import { docElement } from './docElement.js';
import { isServer } from './isServer';

export function setFakeBody (body) {
  var docOverflow = '';
  if (!isServer && body.fake) {
    docOverflow = docElement.style.overflow;
    //avoid crashing IE8, if background image is used
    body.style.background = '';
    //Safari 5.13/5.1.4 OSX stops loading if ::-webkit-scrollbar is used and scrollbars are visible
    body.style.overflow = docElement.style.overflow = 'hidden';
    docElement.appendChild(body);
  }

  return docOverflow;
}