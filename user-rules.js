module.exports = {
	"missing-description": {
		priority: 1,
		include: ['**/*.field-meta.xml']
	},
	"deprecated-api-version": {
		priority: 1,
	},
	"flow-inactive": {
		priority: 1,
	},
	"object-internal-sharing-no-readwrite": {
		priority: 1,
	},
	"object-external-sharing-no-readwrite": {
		priority: 2,
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
	}
	
}
