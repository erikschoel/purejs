CALL stp_selectRecords('sys.type.d%', 'sys.lang.nl');

SELECT * FROM main_record ORDER BY mare_id DESC;
-- 137
SELECT * FROM main_dimension_record ORDER BY madr_id DESC;
SELECT * FROM main_record_value ORDER BY mava_id DESC;
SELECT * FROM main_dimension ORDER BY madi_code;-- DESC;

DELETE FROM main_dimension_record WHERE madr_fk_record > 137;

select func_getDimensionID('sys.attr.desc');
CALL stp_selectRecursive(287, 'sys.lang.nl', FALSE);

CALL stp_selectRecursive(97, 'sys.lang.nl', TRUE);

CALL stp_selectMeta('', 'sys.lang.nl');

select * from main_relation where marl_fk_parent_dimension = 163 and marl_fk_child_dimension = 163;

CALL stp_upsertDimensionRecord('sys.type.department', 'mgmt', @dep_id);
CALL stp_upsertDimensionRecordValue(@dep_id, 'sys.attr.desc', 'sys.lang.nl', 'Management', 0, @attr_id);
CALL stp_upsertDimensionRecord('sys.type.department', 'sales', @dep_id);
CALL stp_upsertDimensionRecordValue(@dep_id, 'sys.attr.desc', 'sys.lang.nl', 'Sales', 0, @attr_id);
CALL stp_upsertDimensionRecord('sys.type.department', 'ops', @dep_id);
CALL stp_upsertDimensionRecordValue(@dep_id, 'sys.attr.desc', 'sys.lang.nl', 'Operations', 0, @attr_id);
CALL stp_upsertDimensionRecord('sys.type.department', 'fin', @dep_id);
CALL stp_upsertDimensionRecordValue(@dep_id, 'sys.attr.desc', 'sys.lang.nl', 'Finance', 0, @attr_id);

CALL stp_upsertDimensionRecord('sys.type.system', 'crm', @sys_id);
CALL stp_upsertDimensionRecordValue(@sys_id, 'sys.attr.desc', 'sys.lang.nl', 'CRM', 0, @attr_id);
CALL stp_upsertDimensionRecord('sys.type.system', 'order', @sys_id);
CALL stp_upsertDimensionRecordValue(@sys_id, 'sys.attr.desc', 'sys.lang.nl', 'Order Management', 0, @attr_id);
CALL stp_upsertDimensionRecord('sys.type.system', 'fin', @sys_id);
CALL stp_upsertDimensionRecordValue(@sys_id, 'sys.attr.desc', 'sys.lang.nl', 'Financial', 0, @attr_id);

CALL stp_upsertDimensionRecord('sys.app.menu', 'main', @menu_id);
CALL stp_upsertDimensionRecordValue(@menu_id, 'sys.attr.desc', 'sys.lang.nl', 'Hoofdmenu', 0, @attr_id);

SELECT @menu_id;
SELECT *,
func_getRecordData(madr_fk_record, 'sys.lang.nl')
FROM main_relation_record
LEFT JOIN main_dimension_record
ON madr_id = marr_fk_child
WHERE marr_fk_parent = 97;

DELETE FROM main_relation_record WHERE marr_id in (246, 247, 248);

SELECT *, func_getRecordData(madr_fk_record, 'sys.lang.nl')
FROM main_dimension_record WHERE madr_fk_dimension = func_getDimensionID('sys.app.item');

SELECT * FROM main_record_value WHERE mava_value = 'logout';
SELECT @itm_id;
SELECT @rela_id;
CALL stp_upsertDimensionRecord('sys.app.item', 'system', @itm_id);
CALL stp_upsertDimensionRecordValue(@itm_id, 'sys.attr.desc', 'sys.lang.nl', 'Systeem', 0, @attr_id);
CALL stp_upsertRelationRecord(func_getDimensionID('sys.app.menu.item'), @menu_id, func_getRecordID('sys.app.item', 'sys.attr.code', 'system'), 0, @rela_id);
INSERT INTO main_dimension_record
SELECT
	0 AS madr_id,
    marr_fk_relation as madr_fk_dimension,
    marr_id as madr_fk_record,
    marr_order as madr_order
FROM main_relation_record WHERE marr_id = @rela_id;
SET @rela_madr_id = LAST_INSERT_ID();

START TRANSACTION;
CALL stp_upsertDimensionRecord('sys.app.item', 'admin/datamodel', @itm_id);
CALL stp_upsertDimensionRecordValue(@itm_id, 'sys.attr.desc', 'sys.lang.nl', 'Data Model', 0, @attr_id);
CALL stp_upsertRelationRecord(func_getDimensionID('sys.app.menu.item'), @rela_madr_id, func_getRecordID('sys.app.item', 'sys.attr.code', 'admin/datamodel'), 0, @rela_id);

CALL stp_upsertDimensionRecord('sys.app.item', 'admin/viewmodel', @itm_id);
CALL stp_upsertDimensionRecordValue(@itm_id, 'sys.attr.desc', 'sys.lang.nl', 'View Model', 0, @attr_id);
CALL stp_upsertRelationRecord(func_getDimensionID('sys.app.menu.item'), @rela_madr_id, func_getRecordID('sys.app.item', 'sys.attr.code', 'admin/viewmodel'), 0, @rela_id);
COMMIT;

START TRANSACTION;
SELECT * FROM main_record_value ORDER BY mava_id DESC LIMIT 100;
SELECT * FROM main_dimension_record ORDER BY madr_id DESC LIMIT 100;
COMMIT;
CALL stp_upsertDimensionRecord('sys.app.item', 'app', @itm_id);
CALL stp_upsertDimensionRecordValue(@itm_id, 'sys.attr.desc', 'sys.lang.nl', 'Dashboard', 0, @attr_id);
CALL stp_upsertRelationRecord(func_getDimensionID('sys.app.menu.item'), @menu_id, func_getRecordID('sys.app.item', 'sys.attr.code', 'app'), 0, @rela_id);
							-- n.item({ id: 'app', name: 'Dashboard' });
CALL stp_upsertDimensionRecord('sys.app.item', 'player', @itm_id);
CALL stp_upsertDimensionRecordValue(@itm_id, 'sys.attr.desc', 'sys.lang.nl', 'Player', 0, @attr_id);
CALL stp_upsertRelationRecord(func_getDimensionID('sys.app.menu.item'), @menu_id, func_getRecordID('sys.app.item', 'sys.attr.code', 'player'), 0, @rela_id);
							-- n.item({ id: 'player', name: 'Player' });
CALL stp_upsertDimensionRecord('sys.app.item', 'admin', @itm_id);
CALL stp_upsertDimensionRecordValue(@itm_id, 'sys.attr.desc', 'sys.lang.nl', 'Admin', 0, @attr_id);
CALL stp_upsertRelationRecord(func_getDimensionID('sys.app.menu.item'), @menu_id, func_getRecordID('sys.app.item', 'sys.attr.code', 'admin'), 0, @rela_admin_id);
INSERT INTO main_dimension_record
SELECT
	0 AS madr_id,
    marr_fk_relation as madr_fk_dimension,
    marr_id as madr_fk_record,
    marr_order as madr_order
FROM main_relation_record WHERE marr_id = @rela_admin_id;
SET @rela_admin_id = LAST_INSERT_ID();
							-- n.menu({ id: 'admin', name: 'Admin' }).run(function(opts) {
CALL stp_upsertDimensionRecord('sys.app.item', 'admin/orgchart', @itm_id);
CALL stp_upsertDimensionRecordValue(@itm_id, 'sys.attr.desc', 'sys.lang.nl', 'Organisatie', 0, @attr_id);
CALL stp_upsertRelationRecord(func_getDimensionID('sys.app.menu.item'), @rela_admin_id, func_getRecordID('sys.app.item', 'sys.attr.code', 'admin/orgchart'), 0, @rela_id);
								-- opts.item({ id: 'admin/orgchart', name: 'Organisatie' });
CALL stp_upsertDimensionRecord('sys.app.item', 'admin/questionnaire', @itm_id);
CALL stp_upsertDimensionRecordValue(@itm_id, 'sys.attr.desc', 'sys.lang.nl', 'Questionnaire', 0, @attr_id);
CALL stp_upsertRelationRecord(func_getDimensionID('sys.app.menu.item'), @rela_admin_id, func_getRecordID('sys.app.item', 'sys.attr.code', 'admin/questionnaire'), 0, @rela_id);
								-- opts.item({ id: 'admin/questionnaire', name: 'Questionnaire' });
CALL stp_upsertDimensionRecord('sys.app.item', 'admin/projectmanagement', @itm_id);
CALL stp_upsertDimensionRecordValue(@itm_id, 'sys.attr.desc', 'sys.lang.nl', 'Project Management', 0, @attr_id);
CALL stp_upsertRelationRecord(func_getDimensionID('sys.app.menu.item'), @rela_admin_id, func_getRecordID('sys.app.item', 'sys.attr.code', 'admin/projectmanagement'), 0, @rela_id);
								-- opts.item({ id: 'admin/projectmanagement', name: 'Project Management' });
CALL stp_upsertDimensionRecord('sys.app.item', 'account', @itm_id);
CALL stp_upsertDimensionRecordValue(@itm_id, 'sys.attr.desc', 'sys.lang.nl', 'Account', 0, @attr_id);
CALL stp_upsertDimensionRecordValue(@itm_id, 'sys.attr.class', 'sys', 'pull-right', 0, @attr_id);
CALL stp_upsertRelationRecord(func_getDimensionID('sys.app.menu.item'), @menu_id, func_getRecordID('sys.app.item', 'sys.attr.code', 'account'), 0, @rela_account_id);
INSERT INTO main_dimension_record
SELECT
	0 AS madr_id,
    marr_fk_relation as madr_fk_dimension,
    marr_id as madr_fk_record,
    marr_order as madr_order
FROM main_relation_record WHERE marr_id = @rela_account_id;
SET @rela_account_id = LAST_INSERT_ID();
								-- n.menu({ id: 'account', name: 'Account', 'class': 'pull-right' }).chain(function(opts) {
CALL stp_upsertDimensionRecord('sys.app.item', 'settings', @itm_id);
CALL stp_upsertDimensionRecordValue(@itm_id, 'sys.attr.desc', 'sys.lang.nl', 'Settings', 0, @attr_id);
CALL stp_upsertRelationRecord(func_getDimensionID('sys.app.menu.item.item'), @rela_account_id, func_getRecordID('sys.app.item', 'sys.attr.code', 'settings'), 0, @rela_id);
									-- opts.item({ id: 'settings', name: 'Settings' });
CALL stp_upsertDimensionRecord('sys.app.item', 'logout', @itm_id);
CALL stp_upsertDimensionRecordValue(@itm_id, 'sys.attr.desc', 'sys.lang.nl', 'Logout', 0, @attr_id);
CALL stp_upsertDimensionRecordValue(@itm_id, 'sys.event.click', 'sys', 'handler', 0, @attr_id);
CALL stp_upsertRelationRecord(func_getDimensionID('sys.app.menu.item.item'), @rela_account_id, func_getRecordID('sys.app.item', 'sys.attr.code', 'logout'), 0, @rela_id);
									-- opts.item({ id: 'logout', name: 'Logout', href: 'Javascript:' });
									-- opts.on('click', '[data-id="logout"]', module.handler('logout'));
								-- }).run();
							-- });

-- SELECT * FROM main_dimension ORDER BY madi_code;-- DESC;
SET @entity_id = (SELECT func_getRecordID('sys.type.entity', 'sys.attr.code', 'sys'));
SELECT @entity_id;
-- SELECT func_getRecordID('sys.type.department', 'sys.attr.code', 'mgmt');
CALL stp_upsertRelationRecord(func_getDimensionID('sys.type.entity.department'), @entity_id, func_getRecordID('sys.type.department', 'sys.attr.code', 'mgmt'), 0, @rela_id);
CALL stp_upsertRelationRecord(func_getDimensionID('sys.type.entity.department'), @entity_id, func_getRecordID('sys.type.department', 'sys.attr.code', 'sales'), 0, @rela_id);
CALL stp_upsertRelationRecord(func_getDimensionID('sys.type.entity.department'), @entity_id, func_getRecordID('sys.type.department', 'sys.attr.code', 'ops'), 0, @rela_id);
CALL stp_upsertRelationRecord(func_getDimensionID('sys.type.entity.department'), @entity_id, func_getRecordID('sys.type.department', 'sys.attr.code', 'fin'), 0, @rela_id);
-- SELECT func_getRecordID('sys.type.system', 'sys.attr.code', 'order');
CALL stp_upsertRelationRecord(func_getDimensionID('sys.type.entity.system'), @entity_id, func_getRecordID('sys.type.system', 'sys.attr.code', 'crm'), 0, @rela_id);
CALL stp_upsertRelationRecord(func_getDimensionID('sys.type.entity.system'), @entity_id, func_getRecordID('sys.type.system', 'sys.attr.code', 'order'), 0, @rela_id);
CALL stp_upsertRelationRecord(func_getDimensionID('sys.type.entity.system'), @entity_id, func_getRecordID('sys.type.system', 'sys.attr.code', 'fin'), 0, @rela_id);
