
CALL stp_upsertDimensionRecord('sys.type.app.item', 'main', @menu_id);

CALL stp_upsertDimensionRecord('sys.type.app.item', 'app', @itm_id);
CALL stp_upsertDimensionRecordValue(@itm_id, 'sys.attr.desc', 'sys.lang.nl', 'Dashboard', 0, @attr_id);
CALL stp_upsertDimensionRecordValue(@itm_id, 'sys.attr.route', 'sys.lang.nl', 'app', 0, @attr_id);
CALL stp_upsertRelationRecord(func_getDimensionID('sys.type.app.item.item'), @menu_id, func_getRecordID('sys.type.app.item', 'sys.attr.code', 'app'), 0, @rela_id);

CALL stp_upsertDimensionRecord('sys.type.app.item', 'player', @itm_id);
CALL stp_upsertDimensionRecordValue(@itm_id, 'sys.attr.desc', 'sys.lang.nl', 'Player', 0, @attr_id);
CALL stp_upsertDimensionRecordValue(@itm_id, 'sys.attr.route', 'sys.lang.nl', 'player', 0, @attr_id);
CALL stp_upsertRelationRecord(func_getDimensionID('sys.type.app.item.item'), @menu_id, func_getRecordID('sys.type.app.item', 'sys.attr.code', 'player'), 0, @rela_id);

CALL stp_upsertDimensionRecord('sys.type.entity', 'SYS', @entity_id);
CALL stp_upsertDimension('sys.type.entity', 'item', @item_id);
