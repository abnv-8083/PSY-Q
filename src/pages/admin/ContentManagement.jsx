import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import { ensureSubject } from '../../api/subjectsApi';
import TestBuilder from './TestBuilder';
import QuestionBank from './QuestionBank';

const CONTENT_VIEW = {
    TESTS: 'tests',
    QUESTIONS: 'questions'
};

const ContentManagement = ({ onSubjectChange }) => {
    const [view, setView] = useState(CONTENT_VIEW.TESTS);
    const [psychologySubject, setPsychologySubject] = useState(null);
    const [activeTest, setActiveTest] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initPsychology = async () => {
            try {
                // Initialize Psychology subject via MongoDB API
                const subject = await ensureSubject('Psychology', 'Mock tests for UGC NET Psychology (Paper 1 & Paper 2)');
                setPsychologySubject(subject);
                if (onSubjectChange) onSubjectChange(subject);
            } catch (error) {
                console.error("Error initializing Psychology subject in MongoDB:", error);
            } finally {
                setLoading(false);
            }
        };

        initPsychology();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
                <CircularProgress color="secondary" />
            </Box>
        );
    }

    if (!psychologySubject) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="error">Failed to load subject content. Please try again.</Typography>
            </Box>
        );
    }

    if (view === CONTENT_VIEW.QUESTIONS && psychologySubject && activeTest) {
        return (
            <QuestionBank
                subject={psychologySubject}
                test={activeTest}
                onBack={() => setView(CONTENT_VIEW.TESTS)}
            />
        );
    }

    return (
        <TestBuilder
            subject={psychologySubject}
            onManageQuestions={(test) => {
                setActiveTest(test);
                setView(CONTENT_VIEW.QUESTIONS);
            }}
        />
    );
};

export default ContentManagement;
