// Matching Engine - Analyse CV et calcule le score de correspondance avec les offres
// This module runs on the server-side with Node.js

class MatchingEngine {
    constructor() {
        // French stop words to ignore
        this.stopWords = new Set([
            'le', 'la', 'les', 'de', 'des', 'du', 'en', 'et', 'ou', 'que', 'qui', 'quoi',
            'est', 'sont', 'est', 'sera', 'avec', 'sans', 'dans', 'sur', 'sous', 'pour',
            'par', 'vers', 'chez', 'afin de', 'au', 'aux', 'du', 'des', 'un', 'une', 'des'
        ]);

        // Common skills variants mapping
        this.skillVariants = {
            'javascript': ['js', 'javascript', 'node.js', 'nodejs'],
            'python': ['python', 'py'],
            'java': ['java', 'java spring', 'spring'],
            'c#': ['c#', 'csharp', '.net'],
            'php': ['php'],
            'typescript': ['typescript', 'ts'],
            'react': ['react', 'react.js', 'reactjs'],
            'angular': ['angular', 'angularjs'],
            'vue': ['vue', 'vue.js', 'vuejs'],
            'html': ['html', 'html5'],
            'css': ['css', 'css3'],
            'sql': ['sql', 'mysql', 'postgresql', 'postgres', 'sql server'],
            'docker': ['docker'],
            'kubernetes': ['k8s', 'kubernetes'],
            'aws': ['aws', 'amazon web services'],
            'git': ['git', 'github', 'gitlab'],
            'api': ['api', 'apis', 'rest', 'restful', 'graphql'],
            'linux': ['linux', 'ubuntu', 'debian'],
            'azure': ['azure', 'microsoft azure'],
            'gcp': ['gcp', 'google cloud platform', 'google cloud'],
        };
    }

    /**
     * Extract skills from text (CV or job description)
     */
    extractSkills(text) {
        if (!text) return [];

        const skills = new Set();
        const textLower = text.toLowerCase();

        // Check variants
        for (const [skillName, variants] of Object.entries(this.skillVariants)) {
            for (const variant of variants) {
                if (textLower.includes(variant)) {
                    skills.add(skillName);
                    break;
                }
            }
        }

        // Common French skills patterns
        const frenchSkills = [
            { name: 'communication', patterns: ['communication', 'orale', 'écrite', 'relation client'] },
            { name: 'travail en équipe', patterns: ['travail en équipe', 'collaboration', 'esprit d\'équipe'] },
            { name: 'leadership', patterns: ['leadership', 'encadrement', 'management', 'gestion d\'équipe'] },
            { name: 'proactivité', patterns: ['proactivité', 'initiative', 'autonome'] },
            { name: 'analyse', patterns: ['analyse', 'analytique', 'résolution de problème'] },
            { name: 'organisation', patterns: ['organisation', 'planification', 'gestion de projet'] },
            { name: 'anglais', patterns: ['anglais', 'english', 'b2', 'c1', 'fluent'] },
            { name: 'german', patterns: ['allemand', 'german', 'deutsch'] },
            { name: 'marketing', patterns: ['marketing', 'seo', 'sem', 'social media', 'content'] },
            { name: 'finance', patterns: ['finance', 'comptabilité', 'budget', 'financial'] },
            { name: 'data', patterns: ['data', 'datascience', 'machine learning', 'ai', 'intelligence artificielle'] },
            { name: 'design', patterns: ['design', 'ux', 'ui', 'photoshop', 'figma', 'illustrator'] },
        ];

        for (const skill of frenchSkills) {
            for (const pattern of skill.patterns) {
                if (textLower.includes(pattern)) {
                    skills.add(skill.name);
                    break;
                }
            }
        }

        return Array.from(skills);
    }

    /**
     * Calculate matching score between user profile and job
     * Returns score between 0 and 100
     */
    calculateMatchScore(userProfile, job) {
        if (!userProfile || !job) return 0;

        // Get user skills
        const userSkills = this.getUserSkills(userProfile);

        // Get job required skills
        const jobSkills = this.getJobRequiredSkills(job);

        if (userSkills.length === 0 && jobSkills.length === 0) {
            // No skills information available, use other factors
            return this.calculateBaselineScore(userProfile, job);
        }

        // Calculate skill overlap
        const matchedSkills = userSkills.filter(skill =>
            jobSkills.some(jobSkill => this.skillsMatch(skill, jobSkill))
        );

        // Skill match score (weighted 50%)
        const skillCoverage = jobSkills.length > 0 ? matchedSkills.length / jobSkills.length : 0;
        const skillMatchScore = Math.min(skillCoverage * 100, 100);

        // Location match (weighted 20%)
        const locationScore = this.calculateLocationScore(userProfile, job);

        // Type match (stage/alternance) (weighted 15%)
        const typeScore = this.calculateTypeScore(userProfile, job);

        // Study level match (weighted 15%)
        const studyLevelScore = this.calculateStudyLevelScore(userProfile, job);

        // Weighted combination
        const totalScore =
            skillMatchScore * 0.50 +
            locationScore * 0.20 +
            typeScore * 0.15 +
            studyLevelScore * 0.15;

        return Math.round(Math.min(totalScore, 100));
    }

    /**
     * Get skills from user profile
     */
    getUserSkills(userProfile) {
        const skills = new Set();

        // From profile.skills (stored as array)
        if (Array.isArray(userProfile.skills)) {
            userProfile.skills.forEach(skill => {
                if (typeof skill === 'string') {
                    const skillLower = skill.toLowerCase();
                    // Extract main skill name
                    if (skillLower.includes('javascript')) skills.add('javascript');
                    else if (skillLower.includes('python')) skills.add('python');
                    else if (skillLower.includes('java')) skills.add('java');
                    else if (skillLower.includes('c#') || skillLower.includes('csharp')) skills.add('c#');
                    else if (skillLower.includes('php')) skills.add('php');
                    else if (skillLower.includes('typescript')) skills.add('typescript');
                    else if (skillLower.includes('react')) skills.add('react');
                    else if (skillLower.includes('angular')) skills.add('angular');
                    else if (skillLower.includes('vue')) skills.add('vue');
                    else if (skillLower.includes('html')) skills.add('html');
                    else if (skillLower.includes('css')) skills.add('css');
                    else if (skillLower.includes('sql') || skillLower.includes('mysql') || skillLower.includes('postgres')) skills.add('sql');
                    else if (skillLower.includes('docker')) skills.add('docker');
                    else if (skillLower.includes('kubernetes')) skills.add('kubernetes');
                    else if (skillLower.includes('aws')) skills.add('aws');
                    else if (skillLower.includes('git')) skills.add('git');
                    else if (skillLower.includes('api')) skills.add('api');
                    else if (skillLower.includes('linux')) skills.add('linux');
                    else skills.add(skillLower);
                }
            });
        }

        // From profile.cvUrl (base64 encoded file - in real app, this would be parsed)
        if (userProfile.cvUrl) {
            // In a real implementation, we would parse the actual CV file
            // For now, we rely on the skills entered by the user
        }

        return Array.from(skills);
    }

    /**
     * Get required skills from job
     */
    getJobRequiredSkills(job) {
        const skills = new Set();

        if (Array.isArray(job.skills)) {
            job.skills.forEach(skill => {
                if (typeof skill === 'string') {
                    const skillLower = skill.toLowerCase();
                    if (skillLower.includes('javascript')) skills.add('javascript');
                    else if (skillLower.includes('python')) skills.add('python');
                    else if (skillLower.includes('java')) skills.add('java');
                    else if (skillLower.includes('c#') || skillLower.includes('csharp')) skills.add('c#');
                    else if (skillLower.includes('php')) skills.add('php');
                    else if (skillLower.includes('typescript')) skills.add('typescript');
                    else if (skillLower.includes('react')) skills.add('react');
                    else if (skillLower.includes('angular')) skills.add('angular');
                    else if (skillLower.includes('vue')) skills.add('vue');
                    else if (skillLower.includes('html')) skills.add('html');
                    else if (skillLower.includes('css')) skills.add('css');
                    else if (skillLower.includes('sql') || skillLower.includes('mysql') || skillLower.includes('postgres')) skills.add('sql');
                    else if (skillLower.includes('docker')) skills.add('docker');
                    else if (skillLower.includes('kubernetes')) skills.add('kubernetes');
                    else if (skillLower.includes('aws')) skills.add('aws');
                    else if (skillLower.includes('git')) skills.add('git');
                    else if (skillLower.includes('api')) skills.add('api');
                    else if (skillLower.includes('linux')) skills.add('linux');
                    else skills.add(skillLower);
                }
            });
        }

        // Also check description for skills
        if (job.description) {
            const descriptionSkills = this.extractSkills(job.description);
            descriptionSkills.forEach(skill => skills.add(skill));
        }

        return Array.from(skills);
    }

    /**
     * Check if two skills match (handling variants)
     */
    skillsMatch(skill1, skill2) {
        const s1 = skill1.toLowerCase();
        const s2 = skill2.toLowerCase();

        if (s1 === s2) return true;

        // Check if one contains the other (for partial matches)
        if (s1.includes(s2) || s2.includes(s1)) return true;

        return false;
    }

    /**
     * Calculate location match score
     */
    calculateLocationScore(userProfile, job) {
        const userLocation = (userProfile.location || '').toLowerCase();
        const jobLocation = (job.location || '').toLowerCase();

        // Exact match
        if (userLocation && jobLocation && userLocation === jobLocation) return 100;

        // Check if user has preferred locations
        if (userProfile.preferredLocations && Array.isArray(userProfile.preferredLocations)) {
            const matched = userProfile.preferredLocations.some(loc =>
                jobLocation.includes(loc.toLowerCase()) || loc.toLowerCase().includes(jobLocation)
            );
            if (matched) return 80;
        }

        // No location preference or no match
        if (!userLocation && (!jobLocation || jobLocation === '')) return 100; // Both unspecified
        if (!userLocation && jobLocation) return 50; // User has no preference, job has location
        if (userLocation && !jobLocation) return 80; // Job location unspecified

        return 30; // Different locations
    }

    /**
     * Calculate type match score (stage vs alternance)
     */
    calculateTypeScore(userProfile, job) {
        const preferredTypes = userProfile.preferredTypes || ['stage', 'alternance'];
        const jobType = job.type || 'stage';

        if (preferredTypes.includes(jobType)) return 100;
        return 40;
    }

    /**
     * Calculate study level match score
     */
    calculateStudyLevelScore(userProfile, job) {
        const userLevel = (userProfile.studyLevel || '').toLowerCase();
        const jobLevel = (job.studyLevel || '').toLowerCase();

        // Direct match
        if (userLevel && jobLevel && (userLevel === jobLevel || jobLevel.includes(userLevel))) {
            return 100;
        }

        // No preference from user, job requires specific level
        if (!userLevel && jobLevel) return 60;

        // Job has no specific requirement
        if (userLevel && !jobLevel) return 90;

        return 70;
    }

    /**
     * Calculate baseline score when no skills information available
     */
    calculateBaselineScore(userProfile, job) {
        let score = 50; // Start with neutral score

        // Location bonus
        if (this.calculateLocationScore(userProfile, job) >= 80) score += 20;

        // Type match bonus
        if (this.calculateTypeScore(userProfile, job) >= 80) score += 15;

        return Math.min(score, 100);
    }

    /**
     * Update match scores for all jobs based on user profile
     */
    async updateJobMatchScores(jobs, userProfile) {
        return jobs.map(job => ({
            ...job,
            matchScore: this.calculateMatchScore(userProfile, job)
        }));
    }
}

module.exports = MatchingEngine;
