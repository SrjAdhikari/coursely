//* src/schemas/progresses.schema.ts

const progressesSchema = {
	$jsonSchema: {
		bsonType: "object",
		required: [
			"_id",
			"userId",
			"lessonId",
			"courseId",
			"positionSeconds",
			"completed",
		],
		properties: {
			_id: {
				bsonType: "objectId",
				description: "Document id",
			},
			userId: {
				bsonType: "objectId",
				description: "Student id",
			},
			lessonId: {
				bsonType: "objectId",
				description: "Lesson id",
			},
			courseId: {
				bsonType: "objectId",
				description: "Owning course id (denormalized from the lesson)",
			},
			positionSeconds: {
				bsonType: "number",
				minimum: 0,
				description: "Last saved playhead position, in seconds",
			},
			completed: {
				bsonType: "bool",
				description: "Whether the lesson is marked complete",
			},
			completedAt: {
				bsonType: ["date", "null"],
				description: "Completion timestamp, or null while incomplete",
			},
			createdAt: {
				bsonType: "date",
				description: "Creation timestamp",
			},
			updatedAt: {
				bsonType: "date",
				description: "Last-update timestamp",
			},
			__v: {
				bsonType: "number",
				description: "Mongoose document version key",
			},
		},
		additionalProperties: false,
	},
};

export default progressesSchema;
