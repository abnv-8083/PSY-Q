import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import { supabase } from '../../lib/supabaseClient';
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
                // Try to find Psychology subject in Supabase
                let { data: subjects, error } = await supabase
                    .from('subjects')
                    .select('*')
                    .eq('name', 'Psychology')
                    .single();

                if (error && error.code !== 'PGRST116') { // PGRST116 is 'no rows returned'
                    throw error;
                }

                if (!subjects) {
                    console.log("Psychology subject not found in Supabase, creating...");
                    const { data: newSubject, error: insertError } = await supabase
                        .from('subjects')
                        .insert({
                            name: 'Psychology',
                            description: 'Mock tests for UGC NET Psychology (Paper 1 & Paper 2)'
                        })
                        .select()
                        .single();

                    if (insertError) throw insertError;
                    subjects = newSubject;
                }

                setPsychologySubject(subjects);
                if (onSubjectChange) onSubjectChange(subjects);
            } catch (error) {
                console.error("Error initializing Psychology subject in Supabase:", error);
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
