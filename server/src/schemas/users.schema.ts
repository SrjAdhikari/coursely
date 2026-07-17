//* src/schemas/users.schema.ts

const usersSchema = {
	$jsonSchema: {
		bsonType: "object",
		required: ["_id", "name", "email"],
		properties: {
			_id: {
				bsonType: "objectId",
				description: "Document id",
			},
			name: {
				bsonType: "string",
				maxLength: 50,
				pattern: "^\\p{L}[\\p{L}\\p{M}]*(?:[ '-]\\p{L}[\\p{L}\\p{M}]*)*$",
				description: "Display name, at most 50 characters",
			},
			email: {
				bsonType: "string",
				pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
				description: "Unique login email",
			},
			password: {
				bsonType: "string",
				minLength: 8,
				description: "Password must be at least 8 characters long",
			},
			provider: {
				bsonType: "string",
				enum: ["email", "google"],
				description: "Provider must be one of email, or google",
			},
			avatarUrl: {
				bsonType: "string",
				description: "Profile picture URL (Google accounts)",
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
