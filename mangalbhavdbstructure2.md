**Tenants**
**-------**
TenantID (PK)
TenantName
Code UNIQUE
IsActive
DateAdded
DateModified
UpdatedByUser


**Users**
**-----**
UserID (PK)
TenantID (FK -> Tenants.TenantID)
Role ENUM('PANDIT','BHAKT','ADMIN')
LoginID UNIQUE
PasswordHash
IsLocked
Status ENUM('ACTIVE','INACTIVE','SUSPENDED')
LastLoginAt
PasswordChangedAt
DateAdded
DateModified
UpdatedByUser


**Profiles**
**--------**
ProfileID (PK)
TenantID (FK -> Tenants.TenantID)
UserID (FK -> Users.UserID UNIQUE)
FullName
DOB
Gender
PhoneNumber UNIQUE
Email UNIQUE
ExperienceYears
Bio
Languages
BasePrice
ProfilePhotoUrl
VerificationStatus ENUM('PENDING','APPROVED','REJECTED')
IsActive
DateAdded
DateModified
UpdatedByUser



**Locations**
**---------**
LocationID (PK)
TenantID (FK -> Tenants.TenantID)
Name
ContactPerson
ContactPhone
ContactEmail
AddressLine1
AddressLine2
CityID
Pincode
State
Country
Latitude
Longitude
IsActive
DateAdded
DateModified
UpdatedByUser




**Services**
**--------**
ServiceID (PK)
TenantID (FK -> Tenants.TenantID)
Name
Description
DurationMinutes
IsActive
DateAdded
DateModified
UpdatedByUser



**PanditServices**
**--------------**
PanditServiceID (PK)
TenantID (FK -> Tenants.TenantID)
ProfileID (FK -> Profiles.ProfileID)
ServiceID (FK -> Services.ServiceID)
LocationID (FK -> Locations.LocationID)
Price
IsActive
DateAdded
DateModified
UpdatedByUser
UNIQUE(TenantID, ProfileID, ServiceID, LocationID)




**Bookings**
**--------**
BookingID (PK)
TenantID (FK -> Tenants.TenantID)
PanditServiceID (FK -> PanditServices.PanditServiceID)
BhaktProfileID (FK -> Profiles.ProfileID)
Status ENUM(
&nbsp;'REQUESTED',
&nbsp;'CONFIRMED',
&nbsp;'CANCELLED',
&nbsp;'COMPLETED'
)
TotalAmount
PaymentStatus ENUM('PENDING','PAID','REFUNDED')
DateAdded
DateModified
UpdatedByUser



