using System;
namespace FaceUPAI.Models
{
	public class Festival
	{
		#region Fields

		private int festivalID;
		private int tenantID;
		private string festivalName;
		private string festivalNameHindi;
		private string description;
		private string descriptionHindi;
		private string festivalDay;
		private string festivalDayHindi;
		private DateTime festivalDate;
		private int year;
		private string countryCode;
		private string countryName;
		private string type;
		private string primaryType;
		private string locations;
		private string states;
		private string canonicalURL;
		private string urlID;
		private DateTime dateAdded;
		private DateTime dateModified;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the Festival class.
		/// </summary>
		public Festival()
		{
		}

		/// <summary>
		/// Initializes a new instance of the Festival class.
		/// </summary>
		public Festival(int tenantID, string festivalName, string festivalNameHindi, string description, string descriptionHindi, string festivalDay, string festivalDayHindi, DateTime festivalDate, int year, string countryCode, string countryName, string type, string primaryType, string locations, string states, string canonicalURL, string urlID, DateTime dateAdded, DateTime dateModified)
		{
			this.tenantID = tenantID;
			this.festivalName = festivalName;
			this.festivalNameHindi = festivalNameHindi;
			this.description = description;
			this.descriptionHindi = descriptionHindi;
			this.festivalDay = festivalDay;
			this.festivalDayHindi = festivalDayHindi;
			this.festivalDate = festivalDate;
			this.year = year;
			this.countryCode = countryCode;
			this.countryName = countryName;
			this.type = type;
			this.primaryType = primaryType;
			this.locations = locations;
			this.states = states;
			this.canonicalURL = canonicalURL;
			this.urlID = urlID;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
		}

		/// <summary>
		/// Initializes a new instance of the Festival class.
		/// </summary>
		public Festival(int festivalID, int tenantID, string festivalName, string festivalNameHindi, string description, string descriptionHindi, string festivalDay, string festivalDayHindi, DateTime festivalDate, int year, string countryCode, string countryName, string type, string primaryType, string locations, string states, string canonicalURL, string urlID, DateTime dateAdded, DateTime dateModified)
		{
			this.festivalID = festivalID;
			this.tenantID = tenantID;
			this.festivalName = festivalName;
			this.festivalNameHindi = festivalNameHindi;
			this.description = description;
			this.descriptionHindi = descriptionHindi;
			this.festivalDay = festivalDay;
			this.festivalDayHindi = festivalDayHindi;
			this.festivalDate = festivalDate;
			this.year = year;
			this.countryCode = countryCode;
			this.countryName = countryName;
			this.type = type;
			this.primaryType = primaryType;
			this.locations = locations;
			this.states = states;
			this.canonicalURL = canonicalURL;
			this.urlID = urlID;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the FestivalID value.
		/// </summary>
		public  int FestivalID
		{
			get { return festivalID; }
			set { festivalID = value; }
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
		/// Gets or sets the FestivalName value.
		/// </summary>
		public  string FestivalName
		{
			get { return festivalName; }
			set { festivalName = value; }
		}

		/// <summary>
		/// Gets or sets the FestivalNameHindi value.
		/// </summary>
		public  string FestivalNameHindi
		{
			get { return festivalNameHindi; }
			set { festivalNameHindi = value; }
		}

		/// <summary>
		/// Gets or sets the Description value.
		/// </summary>
		public  string Description
		{
			get { return description; }
			set { description = value; }
		}

		/// <summary>
		/// Gets or sets the DescriptionHindi value.
		/// </summary>
		public  string DescriptionHindi
		{
			get { return descriptionHindi; }
			set { descriptionHindi = value; }
		}

		/// <summary>
		/// Gets or sets the FestivalDay value.
		/// </summary>
		public  string FestivalDay
		{
			get { return festivalDay; }
			set { festivalDay = value; }
		}

		/// <summary>
		/// Gets or sets the FestivalDayHindi value.
		/// </summary>
		public  string FestivalDayHindi
		{
			get { return festivalDayHindi; }
			set { festivalDayHindi = value; }
		}

		/// <summary>
		/// Gets or sets the FestivalDate value.
		/// </summary>
		public  DateTime FestivalDate
		{
			get { return festivalDate; }
			set { festivalDate = value; }
		}

		/// <summary>
		/// Gets or sets the Year value.
		/// </summary>
		public  int Year
		{
			get { return year; }
			set { year = value; }
		}

		/// <summary>
		/// Gets or sets the CountryCode value.
		/// </summary>
		public  string CountryCode
		{
			get { return countryCode; }
			set { countryCode = value; }
		}

		/// <summary>
		/// Gets or sets the CountryName value.
		/// </summary>
		public  string CountryName
		{
			get { return countryName; }
			set { countryName = value; }
		}

		/// <summary>
		/// Gets or sets the Type value.
		/// </summary>
		public  string Type
		{
			get { return type; }
			set { type = value; }
		}

		/// <summary>
		/// Gets or sets the PrimaryType value.
		/// </summary>
		public  string PrimaryType
		{
			get { return primaryType; }
			set { primaryType = value; }
		}

		/// <summary>
		/// Gets or sets the Locations value.
		/// </summary>
		public  string Locations
		{
			get { return locations; }
			set { locations = value; }
		}

		/// <summary>
		/// Gets or sets the States value.
		/// </summary>
		public  string States
		{
			get { return states; }
			set { states = value; }
		}

		/// <summary>
		/// Gets or sets the CanonicalURL value.
		/// </summary>
		public  string CanonicalURL
		{
			get { return canonicalURL; }
			set { canonicalURL = value; }
		}

		/// <summary>
		/// Gets or sets the UrlID value.
		/// </summary>
		public  string UrlID
		{
			get { return urlID; }
			set { urlID = value; }
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
