document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const header = document.querySelector("header")
  const menuToggle = document.querySelector(".menu-toggle")
  const navMenu = document.querySelector(".nav-menu")
  const scrollToTop = document.querySelector(".scroll-to-top")
  const navLinks = document.querySelectorAll(".nav-menu a")
  const skillBars = document.querySelectorAll(".skill-progress")
  const skillSection = document.querySelector("#skills")
  const filterBtns = document.querySelectorAll(".filter-btn")
  const projectItems = document.querySelectorAll(".project-item")
  const contactForm = document.getElementById("contactForm")
  const formSuccess = document.getElementById("formSuccess")
  const resetFormBtn = document.getElementById("resetFormBtn")

  // Sticky header and scroll-to-top button
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("sticky")
      scrollToTop.classList.add("active")
    } else {
      header.classList.remove("sticky")
      scrollToTop.classList.remove("active")
    }
    setActiveNavLink()
  })

  // Mobile menu toggle
  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active")
    })

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!navMenu.contains(e.target) && !menuToggle.contains(e.target) && navMenu.classList.contains("active")) {
        navMenu.classList.remove("active")
      }
    })

    // Close menu when clicking on a link
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("active")
      })
    })
  }

  // Scroll to section smoothly
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const targetId = this.getAttribute("href")
      const targetSection = document.querySelector(targetId)
      if (targetSection) {
        const headerHeight = header.offsetHeight
        window.scrollTo({
          top: targetSection.offsetTop - headerHeight,
          behavior: "smooth",
        })
      }
    })
  })

  // Scroll to top
  if (scrollToTop) {
    scrollToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" })
    })
  }

  // Project filter
  if (filterBtns.length && projectItems.length) {
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        filterBtns.forEach((b) => b.classList.remove("active"))
        this.classList.add("active")
        const filter = this.getAttribute("data-filter")
        projectItems.forEach((item) => {
          item.style.display = filter === "all" || item.classList.contains(filter) ? "block" : "none"
        })
      })
    })
  }

  // Animate skill bars on scroll
  if (skillBars.length && skillSection) {
    function animateSkills() {
      if (skillSection.getBoundingClientRect().top < window.innerHeight - 100) {
        skillBars.forEach((bar) => {
          const width = bar.style.width
          bar.style.width = "0"
          setTimeout(() => (bar.style.width = width), 100)
        })
        window.removeEventListener("scroll", animateSkills)
      }
    }
    window.addEventListener("scroll", animateSkills)
  }

  // Contact form validation and interactivity
  if (contactForm) {
    const inputs = {
      name: document.getElementById("name"),
      email: document.getElementById("email"),
      subject: document.getElementById("subject"),
      message: document.getElementById("message"),
    }
    const errors = {
      name: document.getElementById("nameError"),
      email: document.getElementById("emailError"),
      subject: document.getElementById("subjectError"),
      message: document.getElementById("messageError"),
    }

    // Only add event listeners if elements exist
    if (inputs.name && errors.name) {
      inputs.name.addEventListener("input", () => validateField(inputs.name, errors.name, "Please enter your name", 2))
    }

    if (inputs.email && errors.email) {
      inputs.email.addEventListener("input", () => validateEmail(inputs.email, errors.email))
    }

    if (inputs.subject && errors.subject) {
      inputs.subject.addEventListener("input", () =>
        validateField(inputs.subject, errors.subject, "Please enter a subject", 3),
      )
    }

    if (inputs.message && errors.message) {
      inputs.message.addEventListener("input", () =>
        validateField(inputs.message, errors.message, "Please enter your message", 10),
      )
    }

    contactForm.addEventListener("submit", (e) => {
      e.preventDefault()

      // Check if all input elements exist before validation
      const isValid = Object.keys(inputs).every((key) => {
        if (!inputs[key] || !errors[key]) return true

        if (key === "email") {
          return validateEmail(inputs[key], errors[key])
        } else {
          const minLength = key === "name" ? 2 : key === "subject" ? 3 : 10
          const message = `Please enter your ${key}`
          return validateField(inputs[key], errors[key], message, minLength)
        }
      })

      if (isValid) {
        const submitBtn = document.getElementById("submitBtn")
        if (submitBtn) {
          submitBtn.disabled = true
          submitBtn.textContent = "Sending..."
        }

        setTimeout(() => {
          if (contactForm && formSuccess) {
            contactForm.style.display = "none"
            formSuccess.classList.add("show")
          }
        }, 1500)
      }
    })

    if (resetFormBtn && formSuccess) {
      resetFormBtn.addEventListener("click", () => {
        formSuccess.classList.remove("show")
        contactForm.style.display = "block"
        contactForm.reset()

        const submitBtn = document.getElementById("submitBtn")
        if (submitBtn) {
          submitBtn.disabled = false
          submitBtn.textContent = "Send Message"
        }

        // Reset validation classes
        Object.values(inputs).forEach((input) => {
          if (input) input.classList.remove("valid", "error")
        })

        Object.values(errors).forEach((error) => {
          if (error) error.textContent = ""
        })
      })
    }
  }

  // Helper functions
  function validateField(input, errorElement, message, minLength) {
    if (!input || !errorElement) return true

    if (input.value.trim().length < minLength) {
      input.classList.add("error")
      input.classList.remove("valid")
      errorElement.textContent = message
      return false
    } else {
      input.classList.remove("error")
      input.classList.add("valid")
      errorElement.textContent = ""
      return true
    }
  }

  function validateEmail(input, errorElement) {
    if (!input || !errorElement) return true

    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())
    if (!valid) {
      input.classList.add("error")
      input.classList.remove("valid")
      errorElement.textContent = "Please enter a valid email address"
    } else {
      input.classList.remove("error")
      input.classList.add("valid")
      errorElement.textContent = ""
    }
    return valid
  }

  function setActiveNavLink() {
    const sections = document.querySelectorAll("section")
    const navLinks = document.querySelectorAll(".nav-menu a")
    let current = ""

    sections.forEach((section) => {
      const sectionTop = section.offsetTop
      const sectionHeight = section.offsetHeight
      const headerHeight = header.offsetHeight

      if (window.scrollY >= sectionTop - headerHeight - 10) {
        current = section.getAttribute("id")
      }
    })

    navLinks.forEach((link) => {
      link.classList.remove("active")
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active")
      }
    })
  }

  // Accessibility improvements
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navMenu.classList.contains("active")) {
      navMenu.classList.remove("active")
    }
  })

  // Reduced motion support
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.documentElement.style.setProperty("--transition", "none")
    document.querySelectorAll(".animate-text, .animate-fade-in").forEach((el) => {
      el.style.opacity = "1"
      el.style.transform = "none"
      el.style.animation = "none"
    })
  }

  // Handle orientation change
  window.addEventListener("orientationchange", () => {
    navMenu.classList.remove("active")
    setTimeout(setActiveNavLink, 300)
  })
})

