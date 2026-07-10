//* src/schemas/lessons.schema.ts

const lessonsSchema = {
	$jsonSchema: {
		bsonType: "object",
		required: [
			"_id",
			"sectionId",
			"courseId",
			"title",
			"order",
			"isPreview",
			"duration",
		],
		properties: {
			_id: {
				bsonType: "objectId",
				description: "Document id",
			},
			sectionId: {
				bsonType: "objectId",
				description: "Parent section id",
			},
			courseId: {
				bsonType: "objectId",
				description: "Owning course id (denormalized from the section)",
			},
			title: {
				bsonType: "string",
				maxLength: 200,
				description: "Lesson title, at most 200 characters",
			},
			order: {
				bsonType: "number",
				minimum: 0,
				description: "Position of the lesson within the section",
			},
			isPreview: {
				bsonType: "bool",
				description: "Whether the lesson is free to preview",
			},
			videoKey: {
				bsonType: "string",
				description: "Optional storage key for the lesson video",
			},
			duration: {
				bsonType: "number",
				minimum: 0,
				description: "Video length in seconds",
			},
			__v: {
				bsonType: "number",
				description: "Mongoose document version key",
			},
		},
		additionalProperties: false,
	},
};

export default lessonsSchema;
