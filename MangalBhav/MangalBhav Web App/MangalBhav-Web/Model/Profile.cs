using System;
namespace FaceUPAI.Models
{
	public class Profile
	{
		#region Fields

		private int profileID;
		private int tenantID;
		private int userID;
		private string fullName;
		private DateTime dOB;
		private string gender;
		private string phoneNumber;
		private string email;
		private int experienceYears;
		private string bio;
		private string languages;
		private decimal basePrice;
		private string profilePhotoUrl;
		private string verificationStatus;
		private bool isActive;
		private DateTime dateAdded;
		private DateTime dateModified;
		private string updatedByUser;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the Profile class.
		/// </summary>
		public Profile()
		{
		}

		/// <summary>
		/// Initializes a new instance of the Profile class.
		/// </summary>
		public Profile(int tenantID, int userID, string fullName, DateTime dOB, string gender, string phoneNumber, string email, int experienceYears, string bio, string languages, decimal basePrice, string profilePhotoUrl, string verificationStatus, bool isActive, DateTime dateAdded, DateTime dateModified, string updatedByUser)
		{
			this.tenantID = tenantID;
			this.userID = userID;
			this.fullName = fullName;
			this.dOB = dOB;
			this.gender = gender;
			this.phoneNumber = phoneNumber;
			this.email = email;
			this.experienceYears = experienceYears;
			this.bio = bio;
			this.languages = languages;
			this.basePrice = basePrice;
			this.profilePhotoUrl = profilePhotoUrl;
			this.verificationStatus = verificationStatus;
			this.isActive = isActive;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
		}

		/// <summary>
		/// Initializes a new instance of the Profile class.
		/// </summary>
		public Profile(int profileID, int tenantID, int userID, string fullName, DateTime dOB, string gender, string phoneNumber, string email, int experienceYears, string bio, string languages, decimal basePrice, string profilePhotoUrl, string verificationStatus, bool isActive, DateTime dateAdded, DateTime dateModified, string updatedByUser)
		{
			this.profileID = profileID;
			this.tenantID = tenantID;
			this.userID = userID;
			this.fullName = fullName;
			this.dOB = dOB;
			this.gender = gender;
			this.phoneNumber = phoneNumber;
			this.email = email;
			this.experienceYears = experienceYears;
			this.bio = bio;
			this.languages = languages;
			this.basePrice = basePrice;
			this.profilePhotoUrl = profilePhotoUrl;
			this.verificationStatus = verificationStatus;
			this.isActive = isActive;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the ProfileID value.
		/// </summary>
		public  int ProfileID
		{
			get { return profileID; }
			set { profileID = value; }
		}

		/// <summary>
		/// Gets or sets the TenantID value.
		/// </summary>
		public  int TenantID
		{
			get { return tenantID; }
			set { tenantID = value; }
		}

		/// <summary>
		/// Gets or sets the UserID value.
		/// </summary>
		public  int UserID
		{
			get { return userID; }
			set { userID = value; }
		}

		/// <summary>
		/// Gets or sets the FullName value.
		/// </summary>
		public  string FullName
		{
			get { return fullName; }
			set { fullName = value; }
		}

		/// <summary>
		/// Gets or sets the DOB value.
		/// </summary>
		public  DateTime DOB
		{
			get { return dOB; }
			set { dOB = value; }
		}

		/// <summary>
		/// Gets or sets the Gender value.
		/// </summary>
		public  string Gender
		{
			get { return gender; }
			set { gender = value; }
		}

		/// <summary>
		/// Gets or sets the PhoneNumber value.
		/// </summary>
		public  string PhoneNumber
		{
			get { return phoneNumber; }
			set { phoneNumber = value; }
		}

		/// <summary>
		/// Gets or sets the Email value.
		/// </summary>
		public  string Email
		{
			get { return email; }
			set { email = value; }
		}

		/// <summary>
		/// Gets or sets the ExperienceYears value.
		/// </summary>
		public  int ExperienceYears
		{
			get { return experienceYears; }
			set { experienceYears = value; }
		}

		/// <summary>
		/// Gets or sets the Bio value.
		/// </summary>
		public  string Bio
		{
			get { return bio; }
			set { bio = value; }
		}

		/// <summary>
		/// Gets or sets the Languages value.
		/// </summary>
		public  string Languages
		{
			get { return languages; }
			set { languages = value; }
		}

		/// <summary>
		/// Gets or sets the BasePrice value.
		/// </summary>
		public  decimal BasePrice
		{
			get { return basePrice; }
			set { basePrice = value; }
		}

		/// <summary>
		/// Gets or sets the ProfilePhotoUrl value.
		/// </summary>
		public  string ProfilePhotoUrl
		{
			get { return profilePhotoUrl; }
			set { profilePhotoUrl = value; }
		}

		/// <summary>
		/// Gets or sets the VerificationStatus value.
		/// </summary>
		public  string VerificationStatus
		{
			get { return verificationStatus; }
			set { verificationStatus = value; }
		}

		/// <summary>
		/// Gets or sets the IsActive value.
		/// </summary>
		public  bool IsActive
		{
			get { return isActive; }
			set { isActive = value; }
		}

		/// <summary>
		/// Gets or sets the DateAdded value.
		/// </summary>
		public  DateTime DateAdded
		{
			get { return dateAdded; }
			set { dateAdded = value; }
		}

		/// <summary>
		/// Gets or sets the DateModified value.
		/// </summary>
		public  DateTime DateModified
		{
			get { return dateModified; }
			set { dateModified = value; }
		}

		/// <summary>
		/// Gets or sets the UpdatedByUser value.
		/// </summary>
		public  string UpdatedByUser
		{
			get { return updatedByUser; }
			set { updatedByUser = value; }
		}

		#endregion
	}
}
