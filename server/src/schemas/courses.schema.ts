//* src/schemas/courses.schema.ts

const coursesSchema = {
	$jsonSchema: {
		bsonType: "object",
		required: [
			"_id",
			"title",
			"slug",
			"description",
			"instructorName",
			"price",
			"currency",
			"isPublished",
			"createdAt",
			"updatedAt",
		],
		properties: {
			_id: {
				bsonType: "objectId",
				description: "Document id",
			},
			title: {
				bsonType: "string",
				maxLength: 200,
				description: "Course title, at most 200 characters",
			},
			slug: {
				bsonType: "string",
				description: "URL-safe unique slug",
			},
			description: {
				bsonType: "string",
				description: "Course description",
			},
			instructorName: {
				bsonType: "string",
				description: "Instructor display name",
			},
			thumbnailUrl: {
				bsonType: "string",
				description: "Optional cover image URL (legacy/external thumbnails)",
			},
			thumbnailKey: {
				bsonType: "string",
				description: "Optional storage key for the uploaded thumbnail image",
			},
			trailerKey: {
				bsonType: "string",
				description: "Optional storage key for the trailer video",
			},
			price: {
				bsonType: "number",
				minimum: 0,
				description: "Price in the smallest currency unit",
			},
			currency: {
				bsonType: "string",
				description: "ISO currency code (defaults to INR)",
			},
			isPublished: {
				bsonType: "bool",
				description: "Whether the course is publicly visible",
			},
			category: {
				bsonType: "string",
				description: "Optional category label",
			},
			learningOutcomes: {
				bsonType: "array",
				items: { bsonType: "string" },
				description: "What the student will learn (optional; legacy docs predate it)",
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

export default coursesSchema;
