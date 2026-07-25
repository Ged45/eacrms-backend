import { auditRepository } from "./audit.repository";

import { AuditLogDTO } from "./audit.types";
export const auditService = {

    async log(data: AuditLogDTO) {

        return auditRepository.create(data);

    },

};