-- ============================================================
-- Default perception dimensions — Teasing vs Pleasing framework
-- ============================================================

INSERT INTO perception_dimensions (position, teasing_label, pleasing_label) VALUES
    (1, 'Good at saying NO',                    'Bad at saying NO'),
    (2, 'Prioritise their own initiatives',     'Deprioritise their own initiatives'),
    (3, 'Proactive',                            'Reactive'),
    (4, 'Have a seat at the table',             'Lack a seat at the table'),
    (5, 'Listened to',                          'Ignored'),
    (6, 'Involved early',                       'Involved late'),
    (7, 'Stakeholders ask to grow the team',    'Stakeholders question why the team is so big'),
    (8, 'Great business / product understanding','Lack business / product understanding')
ON CONFLICT DO NOTHING;
