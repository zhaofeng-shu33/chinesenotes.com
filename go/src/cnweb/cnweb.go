/*
Web application for finding documents in the corpus
*/
package main

import (
	"cnweb/applog"
	"cnweb/find"
	"cnweb/identity"
	"cnweb/webconfig"
	"encoding/json"
	"fmt"
	"html/template"
	"net/http"
	"os"
)

// Starting point for the Administration Portal
func adminHandler(w http.ResponseWriter, r *http.Request) {
	sessionInfo := identity.InvalidSession()
	cookie, err := r.Cookie("session")
	if err == nil {
		sessionInfo = identity.CheckSession(cookie.Value)
	}
	if identity.IsAuthorized(sessionInfo.User, "admin_portal") {
		vars := webconfig.GetAll()
		tmpl, err := template.New("admin_portal.html").ParseFiles("templates/admin_portal.html")
		if err != nil {
			applog.Error("adminHandler: error parsing template", err)
		}
		if tmpl == nil {
			applog.Error("adminHandler: Template is nil")
		}
		if err != nil {
			applog.Error("adminHandler: error parsing template", err)
		}
		err = tmpl.Execute(w, vars)
		if err != nil {
			applog.Error("adminHandler: error rendering template", err)
		}
	} else {
		http.Error(w, "Not authorized", 403)
	}
}

func displayPortalHome(w http.ResponseWriter) {
	vars := webconfig.GetAll()
	tmpl, err := template.New("translation_portal.html").ParseFiles("templates/translation_portal.html")
	if err != nil {
		applog.Error("portalHandler: error parsing template", err)
		http.Error(w, "Server Error", 500)
		return
	} else if tmpl == nil {
		applog.Error("portalHandler: Template is nil")
		http.Error(w, "Server Error", 500)
		return
	}
	err = tmpl.Execute(w, vars)
	if err != nil {
		applog.Error("portalHandler: error rendering template", err)
		http.Error(w, "Server Error", 500)
	}
}

func findHandler(response http.ResponseWriter, request *http.Request) {
	url := request.URL
	queryString := url.Query()
	query := queryString["query"]
	q := "No Query"
	if len(query) > 0 {
		q = query[0]
	}
	results, err := find.FindDocuments(q)
	if err != nil {
		applog.Error("main.findHandler searching docs, ", err)
		http.Error(response, "Error searching docs", 500)
		return
	}
	resultsJson, err := json.Marshal(results)
	if err != nil {
		applog.Error("main.findHandler error marshalling JSON, ", err)
		http.Error(response, "Error marshalling results", 500)
	} else {
		//applog.Info("handler, results returned: ", string(resultsJson))
		response.Header().Set("Content-Type", "application/json; charset=utf-8")
		fmt.Fprintf(response, string(resultsJson))
	}
}

// Display login form for the Translation Portal
func loginFormHandler(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.New("login_form.html").ParseFiles("templates/login_form.html")
	if err != nil {
		applog.Error("loginFormHandler: error parsing template", err)
		http.Error(w, "Server Error", 500)
		return
	} else if tmpl == nil {
		applog.Error("loginFormHandler: Template is nil")
		http.Error(w, "Server Error", 500)
		return
	}
	err = tmpl.Execute(w, nil)
	if err != nil {
		applog.Error("portalHandler: error rendering template", err)
		http.Error(w, "Server Error", 500)
		return
	}
}

// Process a login request
func loginHandler(w http.ResponseWriter, r *http.Request) {
	sessionInfo := identity.InvalidSession()
	err := r.ParseForm()
	if err != nil {
		applog.Error("loginHandler: error parsing form", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	username := r.PostFormValue("UserName")
	applog.Info("loginHandler: username = ", username)
	password := r.PostFormValue("Password")
	users, err := identity.CheckLogin(username, password)
	if err != nil {
		applog.Error("main.loginHandler checking login, ", err)
		http.Error(w, "Error checking login", 500)
		return
	}
	if len(users) != 1 {
		applog.Error("loginHandler: user not found", username)
	} else {
		cookie, err := r.Cookie("session")
		if err == nil {
			applog.Error("loginHandler: updating session", cookie.Value)
			sessionInfo = identity.UpdateSession(cookie.Value, users[0], 1)
		}
		if (err != nil) || !sessionInfo.Valid {
			sessionid := identity.NewSessionId()
			//applog.Info("loginHandler: creating new session %v", sessionid)
			cookie := &http.Cookie{
        		Name: "session",
        		Value: sessionid,
        		Domain: webconfig.GetSiteDomain(),
        		Path: "/",
        		MaxAge: 86400*30, // One month
        	}
        	http.SetCookie(w, cookie)
        	sessionInfo = identity.SaveSession(sessionid, users[0], 1)
        }
    }
    if r.Header.Get("Accept-Encoding") == "application/json" {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		resultsJson, err := json.Marshal(sessionInfo)
		if err == nil {
			applog.Error("loginHandler: error marshalling json", err)
			http.Error(w, "Error checking login", 500)
			return
		}
		fmt.Fprintf(w, string(resultsJson))
	} else {
		if sessionInfo.Authenticated == 1 {
			displayPortalHome(w)
		} else {
			loginFormHandler(w, r)
		}
	}
}

func logoutHandler(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("session")
	if err != nil {
		// OK, just don't show the contents that require a login
		applog.Error("logoutHandler: no cookie")
	} else {
		identity.Logout(cookie.Value)
	}
	message := "Please come back again"
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	fmt.Fprintf(w, "{\"message\" :\"%s\"}", message)
}

// Starting point for the Translation Portal
func portalHandler(w http.ResponseWriter, r *http.Request) {
	sessionInfo := identity.InvalidSession()
	cookie, err := r.Cookie("session")
	if err == nil {
		sessionInfo = identity.CheckSession(cookie.Value)
	}
	if identity.IsAuthorized(sessionInfo.User, "translation_portal") {
		displayPortalHome(w)
	} else {
		http.Error(w, "Not authorized", 403)
	}
}

// Static handler for pages in the Translation Portal Library
func portalLibraryHandler(w http.ResponseWriter, r *http.Request) {
	sessionInfo := identity.InvalidSession()
	cookie, err := r.Cookie("session")
	if err == nil {
		sessionInfo = identity.CheckSession(cookie.Value)
	}
	if identity.IsAuthorized(sessionInfo.User, "translation_portal") {
		portalLibHome := os.Getenv("PORTAL_LIB_HOME")
		filename := portalLibHome + "/" + r.URL.Path
		http.ServeFile(w, r, filename)
	} else {
		http.Error(w, "Not authorized", 403)
	}
}

// Check to see if the user has a session
func sessionHandler(w http.ResponseWriter, r *http.Request) {
	sessionInfo := identity.InvalidSession()
	cookie, err := r.Cookie("session")
	if err == nil {
		sessionInfo = identity.CheckSession(cookie.Value)
	}
	if (err != nil) || (!sessionInfo.Valid) {
		// OK, just don't show the contents that don't require a login
		applog.Info("sessionHandler: creating a new cookie")
		sessionid := identity.NewSessionId()
		cookie := &http.Cookie{
        	Name: "session",
        	Value: sessionid,
        	Domain: webconfig.GetSiteDomain(),
        	Path: "/",
        	MaxAge: 86400, // One day
        }
        http.SetCookie(w, cookie)
        userInfo := identity.UserInfo{
			UserID: 1,
			UserName: "",
			Email: "",
			FullName: "",
			Role: "",
		}
        identity.SaveSession(sessionid, userInfo, 0)
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	resultsJson, err := json.Marshal(sessionInfo)
	fmt.Fprintf(w, string(resultsJson))
}

//Entry point for the web application
func main() {
	applog.Info("main.main Started cnweb")

	//index.LoadKeywordIndex()
	//documents := index.FindForKeyword("你")
	http.HandleFunc("/find/", findHandler)
	http.HandleFunc("/loggedin/admin", adminHandler)
	http.HandleFunc("/loggedin/login", loginHandler)
	http.HandleFunc("/loggedin/loginForm", loginFormHandler)
	http.HandleFunc("/loggedin/logout", logoutHandler)
	http.HandleFunc("/loggedin/session", sessionHandler)
	http.HandleFunc("/loggedin/portal", portalHandler)
	http.HandleFunc("/loggedin/portal_library", portalLibraryHandler)
	http.ListenAndServe(":8080", nil)
}
