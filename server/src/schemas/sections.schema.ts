//* src/schemas/sections.schema.ts

const sectionsSchema = {
	$jsonSchema: {
		bsonType: "object",
		required: ["_id", "courseId", "title", "order"],
		properties: {
			_id: {
				bsonType: "objectId",
				description: "Document id",
			},
			courseId: {
				bsonType: "objectId",
				description: "Parent course id",
			},
			title: {
				bsonType: "string",
				maxLength: 200,
				description: "Section title, at most 200 characters",
			},
			order: {
				bsonType: "number",
				minimum: 0,
				description: "Position of the section within the course",
			},
			__v: {
				bsonType: "number",
				description: "Mongoose document version key",
			},
		},
		additionalProperties: false,
	},
};

export default sectionsSchema;
