/*
 * Unit tests for the fulltext package
 */
package fulltext

import (
 	"fmt"
	"testing"
)

// Test to load a local file
func TestGetMatching(t *testing.T) {
	fmt.Printf("fulltext.TestGetMatching: Begin unit test\n")
	loader := LocalTextLoader{"../../../../corpus"}
	queryTerms := []string{"曰風"}
	mt, err := loader.GetMatching("shijing/shijing001.txt", queryTerms)
	if err != nil {
		t.Errorf("TestGetMatching: got an error %v\n", err)
	}
	if mt.Snippet == "" {
		t.Errorf("TestGetMatching: snippet empty\n")
	}
	fmt.Printf("fulltext.TestGetMatching: match: %v\n", mt)
}
