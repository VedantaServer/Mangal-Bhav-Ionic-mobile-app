using System;
namespace FaceUPAI.Models
{
	public class UserReferralCode
	{
		#region Fields

		private int tenantID;
		private int userReferralCodeID;
		private int userID;
		private string referralCode;
		private DateTime dateAdded;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the UserReferralCode class.
		/// </summary>
		public UserReferralCode()
		{
		}

		/// <summary>
		/// Initializes a new instance of the UserReferralCode class.
		/// </summary>
		public UserReferralCode(int tenantID, int userID, string referralCode, DateTime dateAdded)
		{
			this.tenantID = tenantID;
			this.userID = userID;
			this.referralCode = referralCode;
			this.dateAdded = dateAdded;
		}

		/// <summary>
		/// Initializes a new instance of the UserReferralCode class.
		/// </summary>
		public UserReferralCode(int tenantID, int userReferralCodeID, int userID, string referralCode, DateTime dateAdded)
		{
			this.tenantID = tenantID;
			this.userReferralCodeID = userReferralCodeID;
			this.userID = userID;
			this.referralCode = referralCode;
			this.dateAdded = dateAdded;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the TenantID value.
		/// </summary>
		public  int TenantID
		{
			get { return tenantID; }
			set { tenantID = value; }
		}

		/// <summary>
		/// Gets or sets the UserReferralCodeID value.
		/// </summary>
		public  int UserReferralCodeID
		{
			get { return userReferralCodeID; }
			set { userReferralCodeID = value; }
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
		/// Gets or sets the ReferralCode value.
		/// </summary>
		public  string ReferralCode
		{
			get { return referralCode; }
			set { referralCode = value; }
		}

		/// <summary>
		/// Gets or sets the DateAdded value.
		/// </summary>
		public  DateTime DateAdded
		{
			get { return dateAdded; }
			set { dateAdded = value; }
		}

		#endregion
	}
}
