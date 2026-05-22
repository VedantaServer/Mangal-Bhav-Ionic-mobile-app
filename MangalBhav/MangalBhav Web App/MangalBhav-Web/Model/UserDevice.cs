using System;
namespace FaceUPAI.Models
{
	public class UserDevice
	{
		#region Fields

		private int userDeviceID;
		private string deviceID;
		private int userID;
		private string fCMToken;
		private string platform;
		private bool isActive;
		private DateTime dateAdded;
		private DateTime dateModified;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the UserDevice class.
		/// </summary>
		public UserDevice()
		{
		}

		/// <summary>
		/// Initializes a new instance of the UserDevice class.
		/// </summary>
		public UserDevice(string deviceID, int userID, string fCMToken, string platform, bool isActive, DateTime dateAdded, DateTime dateModified)
		{
			this.deviceID = deviceID;
			this.userID = userID;
			this.fCMToken = fCMToken;
			this.platform = platform;
			this.isActive = isActive;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
		}

		/// <summary>
		/// Initializes a new instance of the UserDevice class.
		/// </summary>
		public UserDevice(int userDeviceID, string deviceID, int userID, string fCMToken, string platform, bool isActive, DateTime dateAdded, DateTime dateModified)
		{
			this.userDeviceID = userDeviceID;
			this.deviceID = deviceID;
			this.userID = userID;
			this.fCMToken = fCMToken;
			this.platform = platform;
			this.isActive = isActive;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the UserDeviceID value.
		/// </summary>
		public  int UserDeviceID
		{
			get { return userDeviceID; }
			set { userDeviceID = value; }
		}

		/// <summary>
		/// Gets or sets the DeviceID value.
		/// </summary>
		public  string DeviceID
		{
			get { return deviceID; }
			set { deviceID = value; }
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
		/// Gets or sets the FCMToken value.
		/// </summary>
		public  string FCMToken
		{
			get { return fCMToken; }
			set { fCMToken = value; }
		}

		/// <summary>
		/// Gets or sets the Platform value.
		/// </summary>
		public  string Platform
		{
			get { return platform; }
			set { platform = value; }
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

		#endregion
	}
}
