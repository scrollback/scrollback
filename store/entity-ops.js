"use strict";

var relationsProps = require("./property-list.js").relations,
	objUtils = require("../lib/obj-utils.js");

module.exports = {
	relatedEntityToEntity: function(relatedEntity) {
		var entity = objUtils.clone(relatedEntity);

		relationsProps.forEach(function(e) {
			delete entity[e];
		});

		return entity;
	},
	entityTorelatedEntity: function(entity, relation) {
		var x = objUtils.merge(objUtils.clone(entity), relation);

		delete x.room;
		delete x.user;
	},
	relatedEntityToRelation: function(entity, ref) {
		var relation = {};

		relationsProps.forEach(function(e) {
			if (typeof entity[e] !== "undefined") {
				relation[e] = entity[e];
			}
		});

		relation[entity.type] = entity.id;
		relation[ref.type] = ref.id;

		return relation;
	}
};
