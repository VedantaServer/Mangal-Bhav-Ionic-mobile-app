CREATE TABLE Tenants (
    TenantID INT IDENTITY(1,1) PRIMARY KEY,
    TenantName NVARCHAR(200) NOT NULL,
    Code NVARCHAR(50) NOT NULL UNIQUE,
    IsActive BIT NOT NULL DEFAULT 1,
    DateAdded DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    DateModified DATETIME2 NULL,
    UpdatedByUser NVARCHAR(100) NULL
);


CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    TenantID INT NOT NULL,
    Role VARCHAR(20) NOT NULL,
    LoginID NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(300) NOT NULL,
    IsLocked BIT NOT NULL DEFAULT 0,
    Status VARCHAR(20) NOT NULL,
    LastLoginAt DATETIME2 NULL,
    PasswordChangedAt DATETIME2 NULL,
    DateAdded DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    DateModified DATETIME2 NULL,
    UpdatedByUser NVARCHAR(100) NULL,

    CONSTRAINT FK_Users_Tenant
        FOREIGN KEY (TenantID) REFERENCES Tenants(TenantID),

    CONSTRAINT CK_Users_Role
        CHECK (Role IN ('PANDIT','BHAKT','ADMIN')),

    CONSTRAINT CK_Users_Status
        CHECK (Status IN ('ACTIVE','INACTIVE','SUSPENDED'))
);





CREATE TABLE Profiles (
    ProfileID INT IDENTITY(1,1) PRIMARY KEY,
    TenantID INT NOT NULL,
    UserID INT NOT NULL UNIQUE,

    FullName NVARCHAR(200) NOT NULL,
    DOB DATE NULL,
    Gender VARCHAR(20) NULL,

    PhoneNumber NVARCHAR(20) UNIQUE,
    Email NVARCHAR(200) UNIQUE,

    ExperienceYears INT NULL,
    Bio NVARCHAR(MAX),
    Languages NVARCHAR(200),

    BasePrice DECIMAL(10,2),
    ProfilePhotoUrl NVARCHAR(500),

    VerificationStatus VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    IsActive BIT NOT NULL DEFAULT 1,

    DateAdded DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    DateModified DATETIME2 NULL,
    UpdatedByUser NVARCHAR(100),

    CONSTRAINT FK_Profiles_Tenant
        FOREIGN KEY (TenantID) REFERENCES Tenants(TenantID),

    CONSTRAINT FK_Profiles_User
        FOREIGN KEY (UserID) REFERENCES Users(UserID),

    CONSTRAINT CK_Profile_VerificationStatus
        CHECK (VerificationStatus IN ('PENDING','APPROVED','REJECTED'))
);





CREATE TABLE Locations (
    LocationID INT IDENTITY(1,1) PRIMARY KEY,
    TenantID INT NOT NULL,

    Name NVARCHAR(200) NOT NULL,
    ContactPerson NVARCHAR(200),
    ContactPhone NVARCHAR(20),
    ContactEmail NVARCHAR(200),

    AddressLine1 NVARCHAR(300),
    AddressLine2 NVARCHAR(300),
    CityID INT,
    Pincode NVARCHAR(10),

    State NVARCHAR(100),
    Country NVARCHAR(100),

    Latitude DECIMAL(9,6),
    Longitude DECIMAL(9,6),

    IsActive BIT NOT NULL DEFAULT 1,

    DateAdded DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    DateModified DATETIME2 NULL,
    UpdatedByUser NVARCHAR(100),

    CONSTRAINT FK_Locations_Tenant
        FOREIGN KEY (TenantID) REFERENCES Tenants(TenantID)
);





CREATE TABLE Services (
    ServiceID INT IDENTITY(1,1) PRIMARY KEY,
    TenantID INT NOT NULL,

    Name NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX),
    DurationMinutes INT,

    IsActive BIT NOT NULL DEFAULT 1,

    DateAdded DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    DateModified DATETIME2 NULL,
    UpdatedByUser NVARCHAR(100),

    CONSTRAINT FK_Services_Tenant
        FOREIGN KEY (TenantID) REFERENCES Tenants(TenantID)
);





CREATE TABLE PanditServices (
    PanditServiceID INT IDENTITY(1,1) PRIMARY KEY,
    TenantID INT NOT NULL,

    ProfileID INT NOT NULL,
    ServiceID INT NOT NULL,
    LocationID INT NOT NULL,

    Price DECIMAL(10,2) NOT NULL,

    IsActive BIT NOT NULL DEFAULT 1,

    DateAdded DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    DateModified DATETIME2 NULL,
    UpdatedByUser NVARCHAR(100),

    CONSTRAINT FK_PanditServices_Tenant
        FOREIGN KEY (TenantID) REFERENCES Tenants(TenantID),

    CONSTRAINT FK_PanditServices_Profile
        FOREIGN KEY (ProfileID) REFERENCES Profiles(ProfileID),

    CONSTRAINT FK_PanditServices_Service
        FOREIGN KEY (ServiceID) REFERENCES Services(ServiceID),

    CONSTRAINT FK_PanditServices_Location
        FOREIGN KEY (LocationID) REFERENCES Locations(LocationID),

    CONSTRAINT UQ_PanditService_Combo
        UNIQUE (TenantID, ProfileID, ServiceID, LocationID)
);



CREATE TABLE Bookings (
    BookingID INT IDENTITY(1,1) PRIMARY KEY,
    TenantID INT NOT NULL,

    PanditServiceID INT NOT NULL,
    BhaktProfileID INT NOT NULL,

    Status VARCHAR(20) NOT NULL,
    TotalAmount DECIMAL(10,2),

    PaymentStatus VARCHAR(20) NOT NULL,

    DateAdded DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    DateModified DATETIME2 NULL,
    UpdatedByUser NVARCHAR(100),

    CONSTRAINT FK_Bookings_Tenant
        FOREIGN KEY (TenantID) REFERENCES Tenants(TenantID),

    CONSTRAINT FK_Bookings_PanditService
        FOREIGN KEY (PanditServiceID) REFERENCES PanditServices(PanditServiceID),

    CONSTRAINT FK_Bookings_BhaktProfile
        FOREIGN KEY (BhaktProfileID) REFERENCES Profiles(ProfileID),

    CONSTRAINT CK_Booking_Status
        CHECK (Status IN ('REQUESTED','CONFIRMED','CANCELLED','COMPLETED')),

    CONSTRAINT CK_Booking_PaymentStatus
        CHECK (PaymentStatus IN ('PENDING','PAID','REFUNDED'))
);






 create   function [dbo].[getTableDescriptionPropoerly]
 (
	@TableName varchar(max),
	 @ColName varchar(max)
 )
 returns varchar(max)
 as
 begin
  declare @returnValue varchar(max)
  select @returnValue =  convert(varchar(max),sep.value)  
    from sys.tables st
    inner join sys.columns sc on st.object_id = sc.object_id
    left join sys.extended_properties sep on st.object_id = sep.major_id
                                         and sc.column_id = sep.minor_id
                                         and sep.name = 'MS_Description'
    where st.name = @TableName
    and sc.name = @ColName
	return @returnValue
end



SELECT  
    s.name  AS SchemaName,
    t.name  AS TableName,
    c.name  AS ColumnName,
    ty.name AS DataType,
    c.max_length
FROM sys.columns c
JOIN sys.tables t   ON c.object_id = t.object_id
JOIN sys.schemas s  ON t.schema_id = s.schema_id
JOIN sys.types ty   ON c.user_type_id = ty.user_type_id
WHERE ty.name = 'date'
ORDER BY s.name, t.name;




 ALTER   function [dbo].[getTableDescriptionPropoerly]
 (
	@TableName varchar(max),
	 @ColName varchar(max)
 )
 returns varchar(max)
 as
 begin
  declare @returnValue varchar(max)
  select @returnValue =  convert(varchar(max),sep.value)  
    from sys.tables st
    inner join sys.columns sc on st.object_id = sc.object_id
    left join sys.extended_properties sep on st.object_id = sep.major_id
                                         and sc.column_id = sep.minor_id
                                         and sep.name = 'MS_Description'
    where st.name = @TableName
    and sc.name = @ColName
	return @returnValue
end



create     procedure [dbo].[getChildTablesByTableName](
@TableName varchar(max)
)
as
begin
	SELECT 
		TP.name AS ChildTable  
	FROM
		sys.foreign_keys AS FK
	JOIN
		sys.tables AS TP ON FK.parent_object_id = TP.object_id
	JOIN
		sys.foreign_key_columns AS FKC ON FK.object_id = FKC.constraint_object_id
	JOIN
		sys.columns AS PC ON FKC.parent_column_id = PC.column_id AND FKC.parent_object_id = PC.object_id
	JOIN
		sys.tables AS RFK ON FK.referenced_object_id = RFK.object_id
	JOIN
		sys.columns AS RC ON FKC.referenced_column_id = RC.column_id AND FKC.referenced_object_id = RC.object_id
	WHERE
		RFK.name = @TableName;
end

/*

exec getChildTablesByTableName 'Organization'

*/





SELECT name AS DatabaseName,
       SUSER_SNAME(owner_sid) AS OwnerLogin
FROM sys.databases
WHERE name = 'mangalbhav1';


ALTER AUTHORIZATION ON DATABASE::mangalbhav1 TO sa;



