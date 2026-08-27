# Ethiopian Athletics Competition and Roster Management System (EACRMS)

## Project Overview

The Ethiopian Athletics Competition and Roster Management System (EACRMS)
is being developed to support the management of athletes, coaches, clubs,
competitions, registrations, verification, and federation activities.

The project aims to provide a centralized system where participants can
be registered and managed while federation and club administrators can
perform their responsibilities according to their assigned access.

## Project Task

The main task of this project is to establish the backend foundation for
the EACRMS and implement the main workflows required for managing users
and participants in Ethiopian athletics.

The work focuses on:

- User registration and authentication
- User roles and permissions
- Athlete registration
- Coach registration
- Fayda identity verification
- Club registration and verification
- Policy management
- Audit tracking
- Secure access to system resources

## Work Accomplished

### User Registration and Authentication

A user registration and login workflow has been implemented.

The registration process collects the required user information and
creates an account in the system.

The authentication workflow allows registered users to log in using
their registered email address or phone number and password.

User account status is also considered during authentication so that
only active accounts can successfully log in.

### User Roles and Permissions

The system supports assigning roles to users and managing permissions
associated with those roles.

This provides different levels of access for the different participants
and administrators who use the system.

The goal is to ensure that users can only perform activities appropriate
to their responsibilities.

### Athlete Registration

An athlete registration workflow has been implemented as part of the
system.

The workflow is intended to support athlete account and profile
registration and tracking of the athlete's registration status.

Athletes can be associated with clubs where applicable.

### Coach Registration

The system includes functionality for registering and managing coaches
as participants within the athletics environment.

Coach information can be associated with the appropriate club and
managed according to the user's permissions.

### Fayda Identity Verification

The project includes a Fayda identity verification workflow.

The purpose of this workflow is to verify an athlete's identity and
support the collection and validation of identity information required
during registration.

Verification status is maintained so that the system can distinguish
between verified and unverified registration information.

### Club Registration and Verification

The system includes a workflow for managing athletics clubs.

Clubs can be registered and their verification status can be tracked.

Federation-level users can review club information and manage the
verification process.

### Policy Management

The project includes a policy management area for federation rules and
requirements.

Policies can be associated with different areas of the system, including
clubs, events, and athlete participation.

Policy status, assignments, and changes can be tracked.

### Audit Tracking

Important activities within the system are recorded for accountability.

The project includes audit tracking for activities such as user
registration, login, and changes to managed resources.

This provides a history of important actions performed within the system.

## Main User Workflows

### Athlete

1. Register an account.
2. Provide the required personal information.
3. Complete the identity verification process when required.
4. Associate with a club when applicable.
5. Continue using the system according to the athlete's account status
   and permissions.

### Coach

1. Register or be registered within the system.
2. Provide the required coach information.
3. Associate with the appropriate club.
4. Access permitted functionality according to the assigned role.

### Club Administrator

1. Manage club-related information.
2. Register or manage athletes and coaches associated with the club.
3. Maintain club membership information.
4. Perform actions allowed by the assigned permissions.

### Federation Administrator

1. Review system users and participants.
2. Review and manage clubs.
3. Manage club verification.
4. Manage federation policies.
5. Monitor important system activities.

## Current Project Result

The backend foundation for EACRMS has been established with the main
registration, authentication, verification, role, permission, policy,
and auditing workflows being developed and integrated.

The project currently provides the foundation required to continue
building the competition and roster management functionality.

## Development Status

The project is under active development.

The implemented functionality is being tested and corrected progressively
to ensure that the required workflows operate correctly from registration
through authentication, verification, and authorized system access.

## Conclusion

EACRMS is intended to provide a structured platform for managing
athletics participants and federation activities.

The completed work establishes the foundation for secure user management,
participant registration, identity verification, club management,
policy management, and accountability, allowing the remaining competition
and roster management features to be built on top of this foundation.
