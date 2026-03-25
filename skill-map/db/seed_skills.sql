-- ============================================================
-- Default skill set — matches the "We all have our shape" framework
-- Edit freely — these are just starting defaults
-- ============================================================

INSERT INTO skills (name, category) VALUES
    ('Relationship Building',  'Leadership'),
    ('Product Thinking',       'Leadership'),
    ('Organisation Skills',    'Leadership'),
    ('Communication',          'Leadership'),
    ('Business Context',       'Business'),
    ('Project Management',     'Business'),
    ('Technical Skills',       'Technical'),
    ('Writing',                'Communication'),
    ('Strategic Thinking',     'Leadership'),
    ('Influence',              'Leadership'),
    ('Team Building',          'Leadership'),
    ('Analytical Skills',      'Technical')
ON CONFLICT (name) DO NOTHING;
