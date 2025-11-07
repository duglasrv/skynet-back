-- PostgreSQL data dump for SkyNet

-- Data for table: clients
INSERT INTO public.clients VALUES (7, 'pedro', 'chimal', 'pedro', '50661952', 14.65144775, -90.81447959, '2025-09-13 12:08:16.972928-06', '2025-09-13 12:08:16.972928-06', 'omarsubuyuc@gmail.com');
INSERT INTO public.clients VALUES (9, 'juacnhis', 'chimaltenango 4ta avenida', 'cliente 2', '50661952', 14.66127735, -90.81936121, '2025-10-09 12:40:41.214713-06', '2025-10-09 12:40:41.214713-06', 'omarsubuyuc@gmail.com');
INSERT INTO public.clients VALUES (8, 'cliente', '4ta avenida chimaltenango', 'cliente 1', '987346643', 14.61435701, -90.48472077, '2025-10-01 21:48:17.718745-06', '2025-10-09 13:06:14.253727-06', 'omarsubuyuc@gmail.com');
INSERT INTO public.clients VALUES (1, 'Cliente de Ejemplo S.A.', 'Avenida Siempre Viva 123', 'Juan Pérez', '555-1234', 14.63490000, -90.50690000, '2025-09-12 23:48:14.566279-06', '2025-10-09 13:06:18.188737-06', 'omarsubuyuc@gmail.com');
INSERT INTO public.clients VALUES (5, 'duglas Subuyuc', 'Chimaltenango Chimaltenango', 'duglas Subuyuc', '50661952', 14.61365421, -90.51947602, '2025-09-13 01:25:51.756473-06', '2025-10-09 13:06:22.133532-06', 'omarsubuyuc@gmail.com');
INSERT INTO public.clients VALUES (4, 'Omar Rivera', 'Chimaltenango zona 8', 'Omar Rivera', '50661952', 14.66437089, -90.83482423, '2025-09-13 01:15:27.374009-06', '2025-10-09 13:06:30.186659-06', 'omarsubuyuc@gmail.com');
INSERT INTO public.clients VALUES (6, 'juancho', 'Chimaltenango zona 8', 'juancho', '50661952', 14.54915018, -90.65720558, '2025-09-13 11:57:10.703509-06', '2025-10-09 21:43:19.751633-06', 'fulins@miumg.edu.gt');
INSERT INTO public.clients VALUES (10, 'Omar Rivera v2', 'Chimaltenango zona 8', 'Omar Rivera v2', '50661952', 14.61115942, -90.48614502, '2025-10-15 18:06:33.077344-06', '2025-10-15 18:06:33.077344-06', 'omarsubuyuc@gmail.com');
INSERT INTO public.clients VALUES (3, 'ACME Corpp.sss', 'Zona Industrial 4, Bodega 5, Ciudad de Guatemala', 'Ana Rodriguez', '2233-4455', 14.58250000, -90.51320000, '2025-09-12 23:58:35.006486-06', '2025-10-15 18:09:11.298225-06', 'omarsubuyuc@gmail.com');

-- Data for table: users
-- CORRECCIÓN: Supervisores y Admins (supervisor_id IS NULL) se insertan PRIMERO para satisfacer las llaves foráneas.
INSERT INTO public.users VALUES (3, 'Admin User', 'admin@skynet.com', '$2b$10$K5PouHiLVwB9t8YEVK17sOe6nI4vp1VBsp5kNbyCSmV3tLcVejUPS', 'ADMIN', NULL, true, '2025-09-12 23:42:14.759731-06', '2025-09-12 23:42:14.759731-06');
INSERT INTO public.users VALUES (4, 'Carlos Supervisorsss', 'supervisor@skynet.com', '$2b$10$.H/15UhGBxpx/BijD8Ui4.9VF8NDOJmj1u.Mbh9ieyGIiH2.ZSpJy', 'SUPERVISOR', NULL, true, '2025-09-12 23:45:02.438748-06', '2025-10-15 18:07:46.567601-06');
INSERT INTO public.users VALUES (6, 'supervisor regional', 'regional@gmail.com', '$2b$10$4PEtArQhYTWurz5r3tI0nO5d7dYh.AwyoL2uuzZZOm18CIA1knS7G', 'SUPERVISOR', NULL, true, '2025-09-13 01:25:12.206569-06', '2025-09-13 01:25:12.206569-06');
INSERT INTO public.users VALUES (8, 'gerardo', 'gerardo@gmail.com', '$2b$10$dXHSpI4/clvNqIdygk0TF.t0dfFF8/Lnj55Faw2ew1rpfOXWQPDbi', 'SUPERVISOR', NULL, true, '2025-10-01 21:45:57.020569-06', '2025-10-01 21:45:57.020569-06');
INSERT INTO public.users VALUES (11, 'nuevooooo', 'nuevooooo@skynet.com', '$2b$10$acuADn8QdAjA4Rh.c9HUp..Y21YqRevGTFALm0USsxSTda9Layt76', 'SUPERVISOR', NULL, true, '2025-10-15 18:07:19.890721-06', '2025-10-15 18:07:19.890721-06');
-- CORRECCIÓN: Técnicos (con supervisor_id) se insertan DESPUÉS.
INSERT INTO public.users VALUES (5, 'Maria Tecnica', 'tecnica@skynet.com', '$2b$10$yQIXHeJ4ETf6ZnmRLZgVkO4ISN0a2dgaquKo8/vAukYemAJiqp.ja', 'TECHNICIAN', 4, true, '2025-09-12 23:53:14.924569-06', '2025-09-12 23:53:14.924569-06');
INSERT INTO public.users VALUES (7, 'impreso', 'impreso@gmail.com', '$2b$10$rdelVNvWMD9EbYAiKro2F.0oJO/2HabsWj8aIpgsgEWfG/0oGF1tS', 'TECHNICIAN', 6, true, '2025-09-13 01:25:34.650629-06', '2025-09-13 01:25:34.650629-06');
INSERT INTO public.users VALUES (9, 'tecnico', 'tecnico@gmail.com', '$2b$10$EUKt7KCKAvB64c66mHB8xuiyiJScKw.KDm9HnORxkkWldhfWd1hIG', 'TECHNICIAN', 8, true, '2025-10-01 21:49:18.136226-06', '2025-10-01 21:49:18.136226-06');
INSERT INTO public.users VALUES (10, 'tecnico 3', 'omarsubuyuc@gmail.com', '$2b$10$JMqfm/oEQDyPPcu4SHAKvOMIRTzhUlLyNSOAbEgpHKW/q/WQ96YPe', 'TECHNICIAN', 4, true, '2025-10-09 13:43:12.079917-06', '2025-10-09 13:43:19.53146-06');
INSERT INTO public.users VALUES (12, 'tecccc', 'tecccc@skynet.com', '$2b$10$HjIovgImc0rDb8DzJDgQZug2dkGUaq8DzN3B4LNAy2fRCPXFKzTNG', 'TECHNICIAN', 11, true, '2025-10-15 18:07:38.697689-06', '2025-10-15 18:07:38.697689-06');

-- Data for table: visits
INSERT INTO public.visits VALUES (1, 3, 3, 4, '2025-09-16 03:00:00-06', 'PENDING', '2025-09-12 23:59:44.343957-06', '2025-09-12 23:59:44.343957-06');
INSERT INTO public.visits VALUES (4, 1, 5, 4, '2025-09-13 01:33:00-06', 'FINISHED', '2025-09-13 01:33:14.143311-06', '2025-09-13 01:33:14.143311-06');
INSERT INTO public.visits VALUES (5, 5, 5, 4, '2025-09-13 02:33:00-06', 'FINISHED', '2025-09-13 01:33:25.807752-06', '2025-09-13 01:33:25.807752-06');
INSERT INTO public.visits VALUES (6, 4, 5, 4, '2025-09-13 02:33:00-06', 'FINISHED', '2025-09-13 01:33:28.844656-06', '2025-09-13 01:33:28.844656-06');
INSERT INTO public.visits VALUES (7, 7, 5, 4, '2025-09-13 15:11:00-06', 'FINISHED', '2025-09-13 12:08:36.600801-06', '2025-09-13 12:08:36.600801-06');
INSERT INTO public.visits VALUES (8, 8, 9, 8, '2025-10-03 10:00:00-06', 'PENDING', '2025-10-01 21:51:28.246801-06', '2025-10-01 21:51:28.246801-06');
INSERT INTO public.visits VALUES (9, 8, 9, 8, '2025-10-01 23:55:00-06', 'FINISHED', '2025-10-01 21:53:27.069789-06', '2025-10-01 21:53:27.069789-06');
INSERT INTO public.visits VALUES (3, 5, 5, 4, '2025-09-14 01:28:00-06', 'FINISHED', '2025-09-13 01:28:31.480449-06', '2025-09-13 01:28:31.480449-06');
INSERT INTO public.visits VALUES (2, 3, 5, 4, '2025-09-15 14:00:00-06', 'FINISHED', '2025-09-13 01:16:21.391439-06', '2025-09-13 01:16:21.391439-06');
INSERT INTO public.visits VALUES (10, 9, 5, 4, '2025-10-09 14:45:00-06', 'FINISHED', '2025-10-09 12:43:22.333889-06', '2025-10-09 12:43:22.333889-06');
INSERT INTO public.visits VALUES (11, 3, 5, 4, '2025-10-09 15:06:00-06', 'FINISHED', '2025-10-09 13:04:55.526033-06', '2025-10-09 13:04:55.526033-06');
INSERT INTO public.visits VALUES (12, 9, 5, 4, '2025-10-09 14:10:00-06', 'FINISHED', '2025-10-09 13:09:46.203649-06', '2025-10-09 13:09:46.203649-06');
INSERT INTO public.visits VALUES (13, 9, 5, 4, '2025-10-09 16:25:00-06', 'FINISHED', '2025-10-09 13:22:05.590375-06', '2025-10-09 13:22:05.590375-06');
INSERT INTO public.visits VALUES (14, 9, 5, 4, '2025-10-09 15:33:00-06', 'FINISHED', '2025-10-09 13:31:17.177888-06', '2025-10-09 13:31:17.177888-06');
INSERT INTO public.visits VALUES (15, 9, 5, 4, '2025-10-09 15:39:00-06', 'FINISHED', '2025-10-09 13:37:45.061705-06', '2025-10-09 13:37:45.061705-06');
INSERT INTO public.visits VALUES (16, 9, 5, 4, '2025-10-09 16:42:00-06', 'FINISHED', '2025-10-09 13:39:06.697016-06', '2025-10-09 13:39:06.697016-06');
INSERT INTO public.visits VALUES (17, 6, 5, 4, '2025-10-09 00:40:00-06', 'FINISHED', '2025-10-09 21:37:10.495124-06', '2025-10-09 21:37:10.495124-06');
INSERT INTO public.visits VALUES (18, 10, 12, 11, '2025-10-15 20:10:00-06', 'PENDING', '2025-10-15 18:08:32.784531-06', '2025-10-15 18:08:32.784531-06');
INSERT INTO public.visits VALUES (20, 10, 12, 11, '2025-10-18 18:10:00-06', 'FINISHED', '2025-10-15 18:10:58.633704-06', '2025-10-15 18:10:58.633704-06');
INSERT INTO public.visits VALUES (19, 10, 12, 11, '2025-10-16 19:09:00-06', 'FINISHED', '2025-10-15 18:08:47.897246-06', '2025-10-15 18:08:47.897246-06');

-- Data for table: visit_logs
INSERT INTO public.visit_logs VALUES (1, 4, 'CHECKIN', '2025-09-13 01:34:33.728579-06', 14.66067190, -90.84499770);
INSERT INTO public.visit_logs VALUES (2, 4, 'CHECKOUT', '2025-09-13 01:34:51.992525-06', 14.66067190, -90.84499770);
INSERT INTO public.visit_logs VALUES (3, 5, 'CHECKIN', '2025-09-13 01:36:25.009017-06', 14.66067190, -90.84499770);
INSERT INTO public.visit_logs VALUES (4, 6, 'CHECKIN', '2025-09-13 01:36:27.802399-06', 14.66067190, -90.84499770);
INSERT INTO public.visit_logs VALUES (5, 5, 'CHECKOUT', '2025-09-13 01:36:35.69776-06', 14.66040320, -90.81323520);
INSERT INTO public.visit_logs VALUES (6, 6, 'CHECKOUT', '2025-09-13 01:36:44.108911-06', 14.66040320, -90.81323520);
INSERT INTO public.visit_logs VALUES (7, 7, 'CHECKIN', '2025-09-13 12:09:05.568918-06', 14.66067230, -90.84499990);
INSERT INTO public.visit_logs VALUES (8, 7, 'CHECKOUT', '2025-09-13 12:09:48.017827-06', 14.66067230, -90.84499990);
INSERT INTO public.visit_logs VALUES (9, 9, 'CHECKIN', '2025-10-01 21:54:31.432221-06', 14.66318400, -90.84382650);
INSERT INTO public.visit_logs VALUES (10, 9, 'CHECKIN', '2025-10-01 21:54:31.439619-06', 14.66318400, -90.84382650);
INSERT INTO public.visit_logs VALUES (11, 9, 'CHECKOUT', '2025-10-01 21:57:45.279386-06', 14.66318400, -90.84382650);
INSERT INTO public.visit_logs VALUES (12, 3, 'CHECKIN', '2025-10-09 12:33:03.786135-06', 14.66069290, -90.84499260);
INSERT INTO public.visit_logs VALUES (13, 3, 'CHECKOUT', '2025-10-09 12:33:27.999046-06', 14.66069460, -90.84500910);
INSERT INTO public.visit_logs VALUES (14, 3, 'CHECKOUT', '2025-10-09 12:33:51.427529-06', 14.66069460, -90.84500910);
INSERT INTO public.visit_logs VALUES (15, 2, 'CHECKIN', '2025-10-09 12:35:52.637434-06', 14.66069110, -90.84499110);
INSERT INTO public.visit_logs VALUES (16, 2, 'CHECKOUT', '2025-10-09 12:36:05.749292-06', 14.66069110, -90.84499110);
INSERT INTO public.visit_logs VALUES (17, 10, 'CHECKIN', '2025-10-09 12:44:17.98366-06', 14.65449640, -90.81750650);
INSERT INTO public.visit_logs VALUES (18, 10, 'CHECKOUT', '2025-10-09 12:44:35.177887-06', 14.65449640, -90.81750650);
INSERT INTO public.visit_logs VALUES (19, 11, 'CHECKIN', '2025-10-09 13:05:47.228086-06', 14.65449640, -90.81750650);
INSERT INTO public.visit_logs VALUES (20, 11, 'CHECKOUT', '2025-10-09 13:06:56.469915-06', 14.65449640, -90.81750650);
INSERT INTO public.visit_logs VALUES (21, 12, 'CHECKIN', '2025-10-09 13:10:05.535201-06', 14.65449640, -90.81750650);
INSERT INTO public.visit_logs VALUES (22, 12, 'CHECKOUT', '2025-10-09 13:10:37.957338-06', 14.65449640, -90.81750650);
INSERT INTO public.visit_logs VALUES (23, 13, 'CHECKIN', '2025-10-09 13:22:23.762803-06', 14.66069020, -90.84499280);
INSERT INTO public.visit_logs VALUES (24, 13, 'CHECKOUT', '2025-10-09 13:22:37.702903-06', 14.66069020, -90.84499280);
INSERT INTO public.visit_logs VALUES (25, 13, 'CHECKOUT', '2025-10-09 13:23:12.257672-06', 14.66069020, -90.84499280);
INSERT INTO public.visit_logs VALUES (26, 13, 'CHECKOUT', '2025-10-09 13:24:49.976153-06', 14.66068710, -90.84499830);
INSERT INTO public.visit_logs VALUES (27, 14, 'CHECKIN', '2025-10-09 13:31:38.420279-06', 14.66068880, -90.84499830);
INSERT INTO public.visit_logs VALUES (28, 14, 'CHECKOUT', '2025-10-09 13:31:58.108415-06', 14.66068880, -90.84499830);
INSERT INTO public.visit_logs VALUES (29, 15, 'CHECKIN', '2025-10-09 13:38:05.194553-06', 14.66068880, -90.84499950);
INSERT INTO public.visit_logs VALUES (30, 15, 'CHECKOUT', '2025-10-09 13:38:15.953672-06', 14.66068880, -90.84499950);
INSERT INTO public.visit_logs VALUES (31, 16, 'CHECKIN', '2025-10-09 13:39:16.427155-06', 14.66068880, -90.84499880);
INSERT INTO public.visit_logs VALUES (32, 16, 'CHECKOUT', '2025-10-09 13:39:24.051934-06', 14.66068880, -90.84499880);
INSERT INTO public.visit_logs VALUES (33, 17, 'CHECKIN', '2025-10-09 21:41:39.163627-06', 14.66068880, -90.84499930);
INSERT INTO public.visit_logs VALUES (34, 17, 'CHECKOUT', '2025-10-09 21:43:59.381766-06', 14.66068790, -90.84499660);
INSERT INTO public.visit_logs VALUES (35, 20, 'CHECKIN', '2025-10-15 18:12:06.185437-06', 14.66068560, -90.84499960);
INSERT INTO public.visit_logs VALUES (36, 20, 'CHECKOUT', '2025-10-15 18:12:32.520029-06', 14.66068560, -90.84499960);
INSERT INTO public.visit_logs VALUES (37, 19, 'CHECKIN', '2025-10-15 18:16:58.508333-06', 14.66068560, -90.84499960);
INSERT INTO public.visit_logs VALUES (38, 19, 'CHECKOUT', '2025-10-15 18:17:17.910526-06', 14.66068560, -90.84499960);

-- Data for table: visit_reports
INSERT INTO public.visit_reports VALUES (1, 4, 'todo estuvo bien', 30, '2025-09-13 01:34:51.992525-06');
INSERT INTO public.visit_reports VALUES (2, 5, 'ujuj', 5, '2025-09-13 01:36:35.69776-06');
INSERT INTO public.visit_reports VALUES (3, 6, 'gfgfg', 20, '2025-09-13 01:36:44.108911-06');
INSERT INTO public.visit_reports VALUES (4, 7, 'todo salio bien', 100, '2025-09-13 12:09:48.017827-06');
INSERT INTO public.visit_reports VALUES (5, 9, 'trabajo de soporte tecnico para 3 computadoras', 60, '2025-10-01 21:57:45.279386-06');
INSERT INTO public.visit_reports VALUES (6, 3, 'todo salio muy bien con el cliente', 50, '2025-10-09 12:33:27.999046-06');
INSERT INTO public.visit_reports VALUES (7, 3, 'todo bien', 90, '2025-10-09 12:33:51.427529-06');
INSERT INTO public.visit_reports VALUES (8, 2, 'mi mensjae', 30, '2025-10-09 12:36:05.749292-06');
INSERT INTO public.visit_reports VALUES (9, 10, 'todo bien', 80, '2025-10-09 12:44:35.177887-06');
INSERT INTO public.visit_reports VALUES (10, 11, 'todo bien', 60, '2025-10-09 13:06:56.469915-06');
INSERT INTO public.visit_reports VALUES (11, 12, 'todo bien', 70, '2025-10-09 13:10:37.957338-06');
INSERT INTO public.visit_reports VALUES (12, 13, 'hola este es mi reporte de trbajo', 70, '2025-10-09 13:22:37.702903-06');
INSERT INTO public.visit_reports VALUES (13, 13, 'hola este es mi reporte de trbajo', 70, '2025-10-09 13:23:12.257672-06');
INSERT INTO public.visit_reports VALUES (14, 13, 'hola este es mi reporte de trbajo', 70, '2025-10-09 13:24:49.976153-06');
INSERT INTO public.visit_reports VALUES (15, 14, 'todo salio bienssssss', 70, '2025-10-09 13:31:58.108415-06');
INSERT INTO public.visit_reports VALUES (16, 15, 'hola mi reportre', 55, '2025-10-09 13:38:15.953672-06');
INSERT INTO public.visit_reports VALUES (17, 16, 'lol', 90, '2025-10-09 13:39:24.051934-06');
INSERT INTO public.visit_reports VALUES (18, 17, 'prueba de proyecto', 60, '2025-10-09 21:43:59.381766-06');
INSERT INTO public.visit_reports VALUES (19, 20, 'mensaje de pruebas para nueva template', 50, '2025-10-15 18:12:32.520029-06');
INSERT INTO public.visit_reports VALUES (20, 19, 'hola este es un mensaje de pruebas de template de cliente final', 70, '2025-10-15 18:17:17.910526-06');

-- Update sequence counters to avoid ID conflicts with new data
SELECT pg_catalog.setval('public.clients_id_seq', 12, true);
SELECT pg_catalog.setval('public.users_id_seq', 13, true);
SELECT pg_catalog.setval('public.visit_logs_id_seq', 38, true);
SELECT pg_catalog.setval('public.visit_reports_id_seq', 20, true);
SELECT pg_catalog.setval('public.visits_id_seq', 20, true);