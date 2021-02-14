use cse_dict;

delete from document;
delete from tmindex_uni_domain;
delete from tmindex_unigram;
delete from word_freq_doc;
delete from bigram_freq_doc;

LOAD DATA LOCAL INFILE 'index/documents.tsv' INTO TABLE document CHARACTER SET utf8mb4 LINES TERMINATED BY '\n';
LOAD DATA LOCAL INFILE 'index/tmindex_uni_domain.tsv' INTO TABLE tmindex_uni_domain CHARACTER SET utf8mb4 LINES TERMINATED BY '\n';
LOAD DATA LOCAL INFILE 'index/tmindex_unigram.tsv' INTO TABLE tmindex_unigram CHARACTER SET utf8mb4 LINES TERMINATED BY '\n';
LOAD DATA LOCAL INFILE 'index/word_freq_doc.txt' INTO TABLE word_freq_doc CHARACTER SET utf8mb4 LINES TERMINATED BY '\n';
LOAD DATA LOCAL INFILE 'index/bigram_freq_doc.txt' INTO TABLE bigram_freq_doc CHARACTER SET utf8mb4 LINES TERMINATED BY '\n';

select count(*) from document;
