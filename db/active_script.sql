
SELECT * FROM tmp_recursive ORDER BY tmp_sort_order;
SELECT * FROM tmp_add_records;
SELECT * FROM main_dimension ORDER BY madi_code;
CALL stp_selectRecursive(func_getMadrID('mare_178'), 'sys.lang.nl', FALSE);


				SELECT
					tmp_id,
					marr.marr_fk_relation as tmp_dim_id,
                    madl.madr_fk_dimension as tmp_dim_rec,
					madr.madr_id as tmp_madr_id,
					tmp_madr_id as tmp_parent_id,
					marr.marr_fk_child as tmp_rec_id,
                    marr.marr_order as tmp_order,
                    marr.marr_id as tmp_marr_id,
					tmp_sort_order
				FROM tmp_recursive AS tmp
                JOIN main_dimension_record AS link
				  ON link.madr_fk_record = tmp.tmp_rec_id
				JOIN main_relation_record AS marr
				  ON marr.marr_fk_parent = tmp_madr_id
				LEFT JOIN main_dimension_record AS madr
				  ON madr.madr_fk_record = marr.marr_id
				JOIN main_dimension_record AS madl
                  ON madl.madr_id = marr.marr_fk_child
				WHERE tmp_level = 0;

SELECT * FROM tmp_recursive;

SELECT *, func_getRecordData(madr_fk_record, 'sys.lang.nl')
FROM main_relation_record
JOIN main_dimension_record ON madr_id = marr_fk_child
WHERE marr_fk_parent in (98, 115);

SELECT *
FROM tmp_recursive AS tmp
JOIN main_dimension_record AS link
  ON link.madr_id = tmp.tmp_madr_id;
  
SELECT *, func_getRecordData(madr_fk_record, 'sys.lang.nl')
FROM main_dimension_record
LEFT JOIN main_relation_record ON marr_id = madr_fk_record
-- WHERE madr_fk_dimension IN (163, 164);
WHERE madr_id IN (115, 92);

SELECT * FROM main_relation_record ORDER BY marr_id DESC LIMIT 100;
