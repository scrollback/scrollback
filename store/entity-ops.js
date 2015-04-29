var relationsProps = require("./property-list.js").relations,
	objUtils = require("../lib/obj-utils.js");

module.exports = {
	relatedEntityToEntity: function(relatedEntity) {
		relatedEntity = objUtils.clone(relatedEntity);
		relationsProps.forEach(function(e) {
			delete relatedEntity[e];
		});
		return relatedEntity;
	},
	entityTorelatedEntity: function(entity, relation) {
		var x = objUtils.merge(objUtils.clone(entity), relation);
		delete x.room;
		delete x.user;
	},
	relatedEntityToRelation: function(entity, ref) {
		var relation = {};
		relationsProps.forEach(function(e) {
			relation[e] = entity[e];
		});
		relation[entity.type] = entity.id;
		relation[ref.type] = ref.id;
		return relation;
	}
};
