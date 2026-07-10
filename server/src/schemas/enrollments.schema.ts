//* src/schemas/enrollments.schema.ts

const enrollmentsSchema = {
	$jsonSchema: {
		bsonType: "object",
		required: ["_id", "userId", "courseId", "createdAt"],
		properties: {
			_id: {
				bsonType: "objectId",
				description: "Document id",
			},
			userId: {
				bsonType: "objectId",
				description: "Enrolled student id",
			},
			courseId: {
				bsonType: "objectId",
				description: "Purchased course id",
			},
			stripeSessionId: {
				bsonType: "string",
				description: "Optional Stripe Checkout session id",
			},
			amountPaid: {
				bsonType: "number",
				minimum: 0,
				description: "Optional amount paid, in the smallest currency unit",
			},
			currency: {
				bsonType: "string",
				description: "Optional ISO currency code of the payment",
			},
			createdAt: {
				bsonType: "date",
				description: "Enrollment timestamp",
			},
			__v: {
				bsonType: "number",
				description: "Mongoose document version key",
			},
		},
		additionalProperties: false,
	},
};

export default enrollmentsSchema;
