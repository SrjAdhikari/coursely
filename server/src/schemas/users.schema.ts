//* src/schemas/users.schema.ts

const usersSchema = {
	$jsonSchema: {
		bsonType: "object",
		required: [
			"_id",
			"name",
			"email",
			"password",
			"role",
			"isActive",
			"createdAt",
			"updatedAt",
		],
		properties: {
			_id: {
				bsonType: "objectId",
				description: "Document id",
			},
			name: {
				bsonType: "string",
				maxLength: 100,
				description: "Display name, at most 100 characters",
			},
			email: {
				bsonType: "string",
				pattern: "^\\w+([.-]?\\w+)*@\\w+([.-]?\\w+)*(\\.\\w{2,})+$",
				description: "Unique login email",
			},
			password: {
				bsonType: "string",
				minLength: 8,
				description: "Bcrypt password hash",
			},
			role: {
				bsonType: "string",
				enum: ["student", "admin"],
				description: "Access role: student or admin",
			},
			isActive: {
				bsonType: "bool",
				description: "Whether the account is active",
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

export default usersSchema;
