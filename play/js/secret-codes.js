// The web build keeps the user-activated DOGE link; layout codes are native-only.
(function(root){
    'use strict';
    const DOGE=['KeyD','KeyO','KeyG','KeyE'];
    let buffer=[];
    function match(keys,pattern){return keys.length>=pattern.length&&pattern.every((key,i)=>keys[keys.length-pattern.length+i]===key);}
    function sequence(keys){return match(keys,DOGE)?'doge':null;}
    function reset(game=root.game){
        buffer=[];if(game)delete game._secretWide;
        document.body.classList.remove('ce-secret-wide');
    }
    function handle(event,game=root.game){
        if(!game?._bootComplete||event.repeat||event.isComposing||event.ctrlKey||event.metaKey||event.altKey)return null;
        const target=event.target;if(target?.closest?.('input,textarea,select,[contenteditable="true"],[role="textbox"]'))return null;
        const code=event.code||(/^Arrow/.test(event.key)?event.key:'Key'+String(event.key||'').toUpperCase());
        buffer.push(code);buffer=buffer.slice(-DOGE.length);
        const result=sequence(buffer);if(!result)return null;buffer=[];
        showOriginalLink();
        return result;
    }
    function showOriginalLink(){
        document.getElementById('secret-doge-message')?.remove();
        const box=document.createElement('div');box.id='secret-doge-message';box.setAttribute('role','status');
        box.append(document.createTextNode('You typed DOGE! Such good doge. '));
        const link=document.createElement('a');link.href='https://dogeminer.se';link.target='_blank';link.rel='noopener noreferrer';link.textContent='Visit the original Dogeminer';box.append(link);
        const close=document.createElement('button');close.type='button';close.textContent='×';close.setAttribute('aria-label','Close Doge message');close.addEventListener('click',()=>box.remove());box.append(close);document.body.append(box);
    }
    root.DogeMinerSecrets=Object.freeze({sequence,handle,reset});
    document.addEventListener('keydown',event=>handle(event));
})(window);
