import { JwtPayload } from "../utils/jwt";
import { File as MulterFile } from "multer";

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
    }
    namespace Multer {
      type File = MulterFile;
    }
  }
}

export {};