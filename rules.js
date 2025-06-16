module.exports = {
	
	"missing-description": {
		priority: 2,
		description: "XML metadata is missing description",
		linter: function ( { file, report } ) {
			const description = file.parsedXml?.get('//description')
			if ( !description ) {
				report( "XML metadata is missing description" );
			}
		}
	},
	"deprecated-api-version": {
		priority: 2,
		description: "API Version is deprecated",
		linter: function ( { file, report } ) {
			const apiVersion = file.parsedXml?.get( '//apiVersion' )
			if ( apiVersion && parseFloat( apiVersion.text() ) < 50.0 ) {
				report( "API Version is too low: " + parseFloat( apiVersion.text() ), apiVersion.line() );
			}
		}
	},
	"flow-inactive": {
		priority: 3,
		description: "Flow should be active",
		linter: function ( { file, report } ) {
			const status = file.parsedXml?.get( '//status' )
			if ( status && status.text() !== 'Active' ) {
				report( "Flow is not active", status.line() );
			}
		},
		include: ['**/*.flow-meta.xml']
	},
	"flow-missing-bypass-check": {
		priority: 1,
		description: "RecordTrigger flows must have a bypass check in the entry criteria",
		linter: function ( { file, report } ) {
			const hasObject = file.parsedXml?.get( '//start//object' )?.text() != null;
			if(hasObject){
				const filterFormula = file.parsedXml?.get( '//start//filterFormula' );
				if(!filterFormula?.text().includes('{!$Permission.G_BypassFlowTrigger}')){
					report("Missing bypass check in flow trigger", filterFormula?.line() );
				}
			}
		},
		include: ['**/*.flow-meta.xml']
	},
	"validation-rule-missing-bypass-check": {
		priority: 1,
		description: "Validation Rules must have a bypass check in the entry criteria",
		linter: function ( { file, report } ) {
			const filterFormula = file.parsedXml?.get( '//errorConditionFormula' );
			if(!filterFormula?.text().includes('$Permission.G_BypassValidationRule')){
				report("Missing bypass check in VR", filterFormula?.line() );
			}
		},
		include: ['**/*.validationRule-meta.xml']
	},
	"object-internal-sharing-no-readwrite": {
		priority: 3,
		description: "Object internal sharing should not be set to Public Read/Write",
		linter: function ( { file, report } ) {
			const sharingModel = file.parsedXml?.get( '//sharingModel' );
			if ( sharingModel?.text() === 'ReadWrite' ) {
				report( "Object internal sharing is Public ReadWrite", sharingModel.line() );
			}
		},
		include: ['**/*.object-meta.xml']
	},
	"object-external-sharing-no-readwrite": {
		priority: 1,
		description: "Object external sharing should not be set to Public ReadWrite",
		linter: function ( { file, report } ) {
			const sharingModel = file.parsedXml?.get( '//externalSharingModel' );
			if ( sharingModel?.text() === 'ReadWrite' ) {
				report( "Object external sharing is Public Read/Write", sharingModel.line() );
			}
		},
		include: ['**/*.object-meta.xml']
	}
}
