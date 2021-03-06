/**
* Copyright 2019 IBM Corp. All Rights Reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var objectPath = require('object-path');

const log = require('../bunyan-api').createLogger('Sender');

module.exports = class RazeedashSender {

  constructor(dsa) {
    this._dsa = dsa;
    this._sentSelflinks={};
  }


  // public methods
  get maxItems(){
    return this._dsa.maxItems;
  }

  get resourceCount(){
    return Object.keys(this._sentSelflinks).length;
  }


  send(o) {
    log.debug('send', JSON.stringify(o));
    if (!Array.isArray(o)) {
      o = [o];
    }
    o = this._distill(o);
    let result = this._dsa.send(o);
    return result;
  }


  reset(){
    this.flush();
    this._sentSelflinks={};
  }


  sendPollSummary() {
    let gcObject = {
      'type': 'SYNC',
      'object': Object.keys(this._sentSelflinks)
    };
    let result = this._dsa.send(gcObject);
    this.reset();
    return result;
  }

  // only send selfLink's once and then filter others
  _distill(...resourceArrays) {
    let temp = [];
    resourceArrays.forEach((a) => {
      a.forEach((e) => {
        if (e) {
          let selfLink = objectPath.get(e, 'object.metadata.selfLink');
          if(selfLink && !this._sentSelflinks[selfLink]){
            this._sentSelflinks[selfLink] = true;
            temp.push(e);
          }
        }
      });
    });
    return temp;
  }


  flush() {
    return this._dsa.flush();
  }

};
