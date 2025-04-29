const JiraApi = require('jira-client')

const jiraConfig = new JiraApi({
	protocol: 'https',
	host: 'sesame-team-pfe.atlassian.net',
	username: 'mohamedamine.derouich@sesame.com.tn',
	password: 'ATATT3xFfGF0jMdRvS0K_Z5bvz4MUU6odt2kES6epHUIiceUWiUIcJlByP-ncCdVAwN63TE5kspnHjVGPq4rw7a-zbhA6kkPbtgwiZV-th8WZuPT7fCfd_Ymo88E_AYv0nu7fUoGAsMOmWFgOSdhCMTlwDWVqeKwWxtZeNXanM19mvVRd1eopJo=0D7B1F9D',
	apiVersion: '2',
	strictSSL: true,
})

module.exports = { jiraConfig }
