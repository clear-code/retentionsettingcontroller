function FolderStab(aName) {
	this.prettiestName = aName;
	this._children = [];
}
FolderStab.prototype = {
	prettiestName     : '',
	parent            : null,
	parentMsgFolder   : null,
	retentionSettings : null,
	GetSubFolders : function()
	{
		return {
			_owner : this,
			_index : 0,
			first : function() {
				if (!this._owner._children.length)
					throw 'there is no item.';
			},
			next : function() {
				this.isDone();
				this._index++;
			},
			isDone : function() {
				if (this._index == this._owner._children.length-1)
					throw 'this is done.';
			},
			currentItem : function() {
				return this._owner._children[this._index];
			}
		};
	},
	QueryInterface : function(aIID)
	{
		if(!aIID.equals(Components.interfaces.nsIMsgFolder) &&
			!aIID.equals(Components.interfaces.nsISupports)) {
			throw Components.results.NS_ERROR_NO_INTERFACE;
		}
		return this;
	},
	_children : [],
	_appendChild : function(aFolder)
	{
		this._children.push(aFolder);
		aFolder.parent = this;
		aFolder.parentMsgFolder = this;
		return aFolder;
	}
};

function createFolderStab()
{
	var folder = new FolderStab('ルート');

	var child = folder._appendChild(new FolderStab('子1'));
	child._appendChild(new FolderStab('孫1'));
	child._appendChild(new FolderStab('孫2'));

	child = folder._appendChild(new FolderStab('子2'));
	child._appendChild(new FolderStab('孫3'));
	child._appendChild(new FolderStab('孫4'));

	return folder;
}
