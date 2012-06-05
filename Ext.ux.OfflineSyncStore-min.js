/*
 * Ext.ux.OfflineSyncStore
 */
Ext.define("Ext.ux.OfflineSyncStore",{extend:"Ext.data.Store",config:{trackLocalSync:true,autoServerSync:true,localProxy:null,serverProxy:null},statics:{CREATED:"created",UPDATED:"updated",REMOVED:"removed"},constructor:function(a){a=a||{};this.callParent([a])},loadLocal:function(a,b){this._proxy=this.getLocalProxy();this.load(a,b,true)},loadServer:function(a,b){this._proxy=this.getServerProxy();this.on({load:{fn:this.onServerLoad,single:true,scope:this}});this.load(a,b,true)},sync:function(){this._proxy=this.getLocalProxy();var d=this.callParent(arguments);var c=d.added,a=d.updated,b=d.removed;if(this.getTrackLocalSync()){if(c.length>0){this.storeCreated(c)}if(a.length>0){this.storeUpdated(a)}if(b.length>0){this.storeRemoved(b)}if(this.doAutoServerSync()){this.syncServer()}}return d},syncServer:function(){this._proxy=this.getServerProxy();var e=this,b={},f=e.getModifiedRecordsCollection(Ext.ux.OfflineSyncStore.CREATED),d=e.getModifiedRecordsCollection(Ext.ux.OfflineSyncStore.UPDATED),a=e.getRemovedRecordsCollection(Ext.ux.OfflineSyncStore.REMOVED),g=false;if(f.length>0){for(var c=0;c<f.length;c++){f[c].data[this.getModel().getIdProperty()]=f[c].id}b.create=f;g=true}if(d.length>0){b.update=d;g=true}if(a.length>0){b.destroy=a;g=true}if(g&&e.fireEvent("beforesync",this,b)!==false){e.getProxy().batch({operations:b,listeners:e.getBatchListeners()})}return{added:f,updated:d,removed:a}},storeCreated:function(a){this.storeChanged(a,Ext.ux.OfflineSyncStore.CREATED,false)},storeUpdated:function(d){var g=this.getModifiedCollection(Ext.ux.OfflineSyncStore.CREATED),e=[],k=[],a=false,h=this.getModel().getIdProperty();for(var c=0;c<d.length;c++){var f=d[c];for(var b=0;b<g.length;b++){if(f.data[h]===g[b][h]){a=true;break}}if(a){e.push(f.data)}else{k.push(f)}}this.storeChanged(this.mergeOrReplaceArrays(g,e),Ext.ux.OfflineSyncStore.CREATED,true);this.storeChanged(k,Ext.ux.OfflineSyncStore.UPDATED,false)},storeRemoved:function(f){var g=this.getModifiedCollection(Ext.ux.OfflineSyncStore.CREATED),e=this.getModifiedCollection(Ext.ux.OfflineSyncStore.UPDATED),l=[],m=false,h=this.getModel().getIdProperty();for(var d=0;d<f.length;d++){var c=f[d];for(var b=0;b<g.length;b++){if(c.data[h]===g[b][h]){m=true;g.splice(b,1);break}}for(var a=0;a<e.length;a++){if(c.data[h]===e[a][h]){e.splice(a,1);break}}if(!m){l.push(c)}}this.storeChanged(g,Ext.ux.OfflineSyncStore.CREATED,true);this.storeChanged(e,Ext.ux.OfflineSyncStore.UPDATED,true);this.storeChanged(l,Ext.ux.OfflineSyncStore.REMOVED,false)},storeChanged:function(e,j,a){var f=this.getLocalProxy().getId()+"-"+j,g=[];for(var c=0;c<e.length;c++){var b=e[c].isModel?e[c].data:e[c];g.push(b)}var h=localStorage.getItem(f),d=!Ext.isEmpty(h)?Ext.decode(h):[];if(!a){g=this.mergeOrReplaceArrays(d,g)}localStorage.removeItem(f);localStorage.setItem(f,Ext.encode(g))},onCreateRecords:function(b,a,c){this.callParent(arguments);if(c&&!this.isLocalMode()){this.clearModifiedCollection(Ext.ux.OfflineSyncStore.CREATED)}},onUpdateRecords:function(b,a,c){this.callParent(arguments);if(c&&!this.isLocalMode()){this.clearModifiedCollection(Ext.ux.OfflineSyncStore.UPDATED)}},onDestroyRecords:function(b,a,c){this.callParent(arguments);if(c&&!this.isLocalMode()){this.clearModifiedCollection(Ext.ux.OfflineSyncStore.REMOVED)}},clearModifiedCollection:function(a){localStorage.removeItem(this.getLocalProxy().getId()+"-"+a)},getModifiedCollection:function(b){var c=localStorage.getItem(this.getLocalProxy().getId()+"-"+b),a=!Ext.isEmpty(c)?Ext.decode(c):[];return a},getModifiedRecordsCollection:function(d){var e=this.getModifiedCollection(d),b=[];for(var c=0;c<e.length;c++){var a=this.getById(e[c][this.getModel().getIdProperty()]);if(a){b.push(a)}}return b},getRemovedRecordsCollection:function(d){var e=this.getModifiedCollection(d),b=[];for(var c=0;c<e.length;c++){var a=this.getModel().create(e[c]);if(a){b.push(a)}}return b},onServerLoad:function(b,a,c){if(c){this._proxy=this.getLocalProxy();this._proxy.clear();b.each(function(d){d.setDirty(true)});this.disableTrackLocalSync();this.sync();b.each(function(d){d.commit()});this.enableTrackLocalSync()}else{this.loadLocal()}},isLocalMode:function(){return this.getProxy()===this.getLocalProxy()},disableTrackLocalSync:function(){this.setTrackLocalSync(false)},enableTrackLocalSync:function(){this.setTrackLocalSync(true)},hasPendingServerSync:function(){return this.hasPendingCreated()||this.hasPendingUpdated()||this.hasPendingRemoved()},hasPendingCreated:function(){return this.getModifiedCollection(Ext.ux.OfflineSyncStore.CREATED).length>0},hasPendingUpdated:function(){return this.getModifiedCollection(Ext.ux.OfflineSyncStore.UPDATED).length>0},hasPendingRemoved:function(){return this.getModifiedCollection(Ext.ux.OfflineSyncStore.REMOVED).length>0},doAutoServerSync:function(){var a=this.getAutoServerSync();if(Ext.isFunction(a)){a=a.call(this)}return a},applyServerProxy:function(b,a){return this.applyProxy(b,a)},updateServerProxy:function(a){this.updateProxy(a)},applyLocalProxy:function(b,a){return this.applyProxy(b,a)},updateLocalProxy:function(a){this.updateProxy(a)},mergeOrReplaceArrays:function(g,f,b){var e=0,c=g.length,a=f.length,h=false;b=b||this.getModel().getIdProperty();for(;e<c;e++){for(var d=0;d<a;d++){if(g[e][b]===f[d][b]){h=true;break}}if(!h){f.push(g[e])}h=false}return f}});