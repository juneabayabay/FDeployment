PERMISSIONS = [
    # Users & access control
    ("users.view", "View users", "users", "view", "View user accounts"),
    ("users.create", "Create users", "users", "create", "Create user accounts"),
    ("users.update", "Update users", "users", "update", "Update user accounts"),
    ("users.delete", "Delete users", "users", "delete", "Deactivate user accounts"),
    ("roles.view", "View roles", "roles", "view", "View clinic roles"),
    ("roles.manage", "Manage roles", "roles", "manage", "Create and update roles"),
    ("user_roles.view", "View user roles", "user_roles", "view", "View role assignments"),
    ("user_roles.manage", "Manage user roles", "user_roles", "manage", "Assign roles to users"),
    ("permissions.view", "View permissions", "permissions", "view", "View permission catalog"),
    ("permissions.manage", "Manage permissions", "permissions", "manage", "Assign permissions to roles"),
    # Patients
    ("patients.view", "View patients", "patients", "view", "View patient records"),
    ("patients.create", "Create patients", "patients", "create", "Register patients"),
    ("patients.update", "Update patients", "patients", "update", "Update patient records"),
    ("patients.delete", "Delete patients", "patients", "delete", "Archive patient records"),
    # Appointments
    ("appointments.view", "View appointments", "appointments", "view", "View appointments"),
    ("appointments.create", "Create appointments", "appointments", "create", "Book appointments"),
    ("appointments.update", "Update appointments", "appointments", "update", "Modify appointments"),
    ("appointments.delete", "Delete appointments", "appointments", "delete", "Cancel appointments"),
    # Treatments
    ("treatments.view", "View treatments", "treatments", "view", "View treatment records"),
    ("treatments.create", "Create treatments", "treatments", "create", "Create treatment plans"),
    ("treatments.update", "Update treatments", "treatments", "update", "Update treatment records"),
    ("treatments.delete", "Delete treatments", "treatments", "delete", "Cancel treatments"),
    # Billing
    ("billing.view", "View billing", "billing", "view", "View billing records"),
    ("billing.create", "Create billing", "billing", "create", "Create invoices and bills"),
    ("billing.update", "Update billing", "billing", "update", "Update billing records"),
    ("billing.delete", "Delete billing", "billing", "delete", "Void billing records"),
    # Reports & settings
    ("reports.view", "View reports", "reports", "view", "View clinic reports"),
    ("reports.generate", "Generate reports", "reports", "generate", "Generate clinic reports"),
    ("settings.view", "View settings", "settings", "view", "View system settings"),
    ("settings.manage", "Manage settings", "settings", "manage", "Update system settings"),
    # Audit
    ("audit.view", "View audit logs", "audit", "view", "View system audit logs"),
    ("audit.export", "Export audit logs", "audit", "export", "Export audit logs"),
    # Braces / down payments
    ("billing.approve", "Approve down payments", "billing", "approve", "Approve braces down payments"),
    # Dentist directory
    ("dentists.view", "View dentist profiles", "dentists", "view", "View dentist directory"),
    ("dentists.manage", "Manage dentist profiles", "dentists", "manage", "Create and update dentist profiles"),
]

ROLE_PERMISSIONS = {
    "admin": [codename for codename, *_ in PERMISSIONS],
    "dentist": [
        "patients.view",
        "patients.update",
        "appointments.view",
        "appointments.create",
        "appointments.update",
        "treatments.view",
        "treatments.create",
        "treatments.update",
        "billing.view",
        "billing.approve",
        "reports.view",
        "dentists.view",
    ],
    "receptionist": [
        "users.view",
        "roles.view",
        "patients.view",
        "patients.create",
        "patients.update",
        "appointments.view",
        "appointments.create",
        "appointments.update",
        "appointments.delete",
        "billing.view",
        "billing.create",
        "billing.update",
        "reports.view",
        "dentists.view",
    ],
    "user": [
        "patients.view",
        "appointments.view",
        "treatments.view",
        "billing.view",
        "dentists.view",
    ],
}
