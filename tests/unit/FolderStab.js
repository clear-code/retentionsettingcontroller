function FolderStab(aName) {
	this.prettiestName = aName;
}
FolderStab.prototype = {
	prettiestName     : '',
	retentionSettings : null,
	GetSubFolders : function()
	{
		return {
			_owner : this,
			get _items() {
				this._owner._children;
			},
			_index : 0,
			get _count() {
				return this._items.length;
			},
			first : function() {
				if (!this._count)
					throw 'there is no item.';
			},
			next : function() {
				this.isDone();
				this.index++;
			},
			isDone : function() {
				if (this._index == this._count-1)
					throw 'this is done.';
			},
			currentItem : function() {
				return this._items[this._index];
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
		return aFolder;
	}
};

