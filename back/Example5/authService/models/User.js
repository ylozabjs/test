import { Types, mongoose } from "mongoose";

const { Schema } = mongoose;

/**
 * @swagger
 *  components:
 *    schemas:
 *      User:
 *        $ref: "#/components/definitions/UserGet"
 *    definitions:
 *      UserGet:
 *        type: object
 *        properties:
 *          _id:
 *            type: string
 *          username:
 *            type: string
 *          email:
 *            type: string
 *          dataCreated:
 *            type: string
 *          roleID:
 *            type: string
 *      UserPost:
 *        type: object
 *        properties:
 *          email:
 *            type: string
 *          password:
 *            type: string
 *          username:
 *            type: string
 *      UserAuth:
 *        type: object
 *        properties:
 *          email:
 *            type: string
 *          password:
 *            type: string
 */

const userSchema = Schema({
  username: String,
  email: {
    type: String,
    unique: true,
    index: true
  },
  password: {
    type: String,
    select: false
  },
  roleID: Types.ObjectId,
  dateCreated: String
});

export default mongoose.model("User", userSchema);
